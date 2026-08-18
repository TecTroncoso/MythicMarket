// Pure module: no caching, no rate limiting. The route handler owns those.

export type LookupResult = { nickname: string; country: string };

const UPSTREAM_TIMEOUT_MS = 12_000;

export async function lookupPlayer(
  userId: string,
  zoneId: string
): Promise<LookupResult | null> {
  for (const fetcher of [fetchBanana, fetchGoPay, fetchIsan]) {
    try {
      const result = await fetcher(userId, zoneId);
      if (result) return result;
    } catch {
      // swallow — try next upstream
    }
  }
  return null;
}

async function fetchBanana(
  userId: string,
  zoneId: string,
  signal: AbortSignal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
): Promise<LookupResult | null> {
  const url = `https://bananagameshop.com/api/mlbb/validasi?id=${encodeURIComponent(userId)}&serverid=${encodeURIComponent(zoneId)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    status?: string;
    result?: { nickname?: string; country?: string };
  };
  if (json.status !== "success") return null;
  const nickname = cleanNickname(json.result?.nickname ?? "");
  const country = (json.result?.country ?? "").toUpperCase();
  if (!nickname || !country) return null;
  return { nickname, country };
}

async function fetchGoPay(
  userId: string,
  zoneId: string,
  signal: AbortSignal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
): Promise<LookupResult | null> {
  const res = await fetch("https://gopay.co.id/games/v1/order/user-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "MOBILE_LEGENDS",
      data: { userId, zoneId },
    }),
    signal,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    message?: string;
    data?: { username?: string; countryOrigin?: string };
  };
  if (json.message !== "Success") return null;
  const nickname = cleanNickname(json.data?.username ?? "");
  const country = (json.data?.countryOrigin ?? "").toUpperCase();
  if (!nickname || !country) return null;
  return { nickname, country };
}

async function fetchIsan(
  userId: string,
  zoneId: string,
  signal: AbortSignal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
): Promise<LookupResult | null> {
  const url = `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(userId)}&server=${encodeURIComponent(zoneId)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    success?: boolean;
    name?: string;
    country?: string;
  };
  if (!json.success) return null;
  const nickname = cleanNickname(json.name ?? "");
  const country = (json.country ?? "").toUpperCase();
  if (!nickname || !country) return null;
  return { nickname, country };
}

function cleanNickname(raw: string): string {
  // Banana + GoPay occasionally return URL-encoded nicknames with `+` for spaces
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    // not URL-encoded — leave as-is
  }
  return s.replace(/\+/g, " ").trim();
}
