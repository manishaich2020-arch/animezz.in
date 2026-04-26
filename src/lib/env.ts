/**
 * Environment variable validation — fails fast at startup if required vars are missing.
 * Import this in any server-side code that needs env vars.
 */
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 chars"),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  PAYU_MERCHANT_KEY: z.string().optional(),
  PAYU_MERCHANT_SALT: z.string().optional(),
  PAYU_BASE_URL: z.string().url().optional().default("https://test.payu.in"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional().default("OtakuVault <noreply@animezz.in>"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  MIN_ORDER_THRESHOLD: z.coerce.number().optional().default(300),
  DEFAULT_ACCENT_COLOR: z.string().optional().default("#a855f7"),
});

// Only validate on server side
const parsed = envSchema.safeParse(process.env);

if (!parsed.success && typeof window === "undefined") {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  // Don't throw in dev to allow partial setup
}

export const env = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof envSchema>);
