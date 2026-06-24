import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Usamos el cliente Redis si existen las credenciales, de lo contrario un Map simple en memoria para dev
let redisClient: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {
  console.warn("No se pudo inicializar Redis, asegurate de tener UPSTASH_REDIS configurado.");
}

// Fallback in-memory map para desarrollo si no hay Redis
const cache = new Map();

const getLimiter = (requests: number, windowStr: Parameters<typeof Ratelimit.slidingWindow>[0]) => {
  if (redisClient) {
    return new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(requests, windowStr),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }

  // Fallback simple si no hay redis
  return {
    limit: async (identifier: string) => {
      const now = Date.now();
      const windowMs = parseInt(windowStr as string) * 1000; // Asumiendo que es en 's' por simplificación
      const windowStart = now - windowMs;
      
      let userTimestamps = cache.get(identifier) || [];
      userTimestamps = userTimestamps.filter((t: number) => t > windowStart);
      
      if (userTimestamps.length >= requests) {
        return { success: false, reset: userTimestamps[0] + windowMs };
      }
      
      userTimestamps.push(now);
      cache.set(identifier, userTimestamps);
      return { success: true, reset: now + windowMs };
    }
  };
};

export const checkoutRateLimiter = getLimiter(5, "60 s");
export const authRateLimiter = getLimiter(5, "60 s");
