import { Redis } from "@upstash/redis";

// Usamos el cliente Redis si existen las credenciales, de lo contrario un Map en memoria para dev
let redisClient: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {
  console.warn("No se pudo inicializar Redis para cache, usando fallback en memoria.");
}

// Fallback in-memory map para desarrollo si no hay Redis
interface Entry {
  value: unknown;
  expiresAt: number;
}
const memory = new Map<string, Entry>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redisClient) {
    const raw = await redisClient.get<T>(key);
    return raw ?? null;
  }
  const entry = memory.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memory.delete(key);
    return null;
  }
  return entry.value as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (redisClient) {
    await redisClient.set(key, value, { ex: ttlSeconds });
    return;
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheDelete(key: string): Promise<void> {
  if (redisClient) {
    await redisClient.del(key);
    return;
  }
  memory.delete(key);
}
