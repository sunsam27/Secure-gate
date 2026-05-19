import { Ratelimit } from "@upstash/ratelimit";
import type { Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiter instances
// Falls back to fail-open if Upstash is not configured
function createRateLimiter(requests: number, window: Duration) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || !url.startsWith("https")) {
    return null;
  }

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// Login: 5 attempts per IP per 10 minutes
const loginLimiter = createRateLimiter(5, "10 m");

// Forgot password: 3 attempts per IP per 15 minutes
const forgotPasswordLimiter = createRateLimiter(3, "15 m");

export async function checkLoginRateLimit(
  ip: string
): Promise<{ success: boolean; remaining?: number }> {
  if (!loginLimiter) {
    return { success: true };
  }

  try {
    const result = await loginLimiter.limit(`login:${ip}`);
    return { success: result.success, remaining: result.remaining };
  } catch {
    // Fail open - allow the request if rate limiting is unavailable
    return { success: true };
  }
}

export async function checkForgotPasswordRateLimit(
  ip: string
): Promise<{ success: boolean; remaining?: number }> {
  if (!forgotPasswordLimiter) {
    return { success: true };
  }

  try {
    const result = await forgotPasswordLimiter.limit(`forgot-password:${ip}`);
    return { success: result.success, remaining: result.remaining };
  } catch {
    return { success: true };
  }
}
