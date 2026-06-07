/**
 * Centralised environment-variable validation.
 *
 * Auth in this app uses the JWT session strategy, which means every session
 * token is *signed* with `NEXTAUTH_SECRET`. If that secret is missing, too
 * short, or set to a publicly-known placeholder, an attacker who knows it can
 * forge a valid session for any user — including `role: "ADMIN"`. We therefore
 * fail closed at runtime in production rather than booting with a weak secret.
 *
 * Validation is intentionally skipped during `next build`
 * (`NEXT_PHASE === "phase-production-build"`) so that builds do not require a
 * real secret to be present, and relaxed (warn-only) in development.
 */

const KNOWN_WEAK_SECRETS = new Set([
  "dev-only-secret-please-change-in-production-0123456789",
  "change-me-to-a-long-random-string",
  "secret",
  "nextauth",
  "changeme",
]);

const MIN_SECRET_LENGTH = 32;

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function fail(message: string): never {
  throw new Error(
    `[env] ${message}\n` +
      "Generate a strong secret with:  openssl rand -base64 32",
  );
}

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const isProd = process.env.NODE_ENV === "production";
  const secret = process.env.NEXTAUTH_SECRET;

  if (!process.env.DATABASE_URL) {
    if (isProd && !isBuildPhase()) fail("DATABASE_URL is required.");
    else if (!isProd) console.warn("[env] DATABASE_URL is not set.");
  }

  // Only enforce the secret at *runtime* in production. Builds and dev are lenient.
  if (isBuildPhase()) return;

  if (!isProd) {
    if (!secret) {
      console.warn(
        "[env] NEXTAUTH_SECRET is not set — using an insecure development fallback. " +
          "Set a strong secret before deploying.",
      );
    } else if (
      KNOWN_WEAK_SECRETS.has(secret) ||
      secret.length < MIN_SECRET_LENGTH
    ) {
      console.warn(
        "[env] NEXTAUTH_SECRET is weak/known. This is fine for local dev but MUST be " +
          "replaced in production.",
      );
    }
    return;
  }

  // production runtime — fail closed
  if (!secret) {
    fail("NEXTAUTH_SECRET is required in production but is not set.");
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    fail(
      `NEXTAUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters in production (got ${secret.length}).`,
    );
  }
  if (KNOWN_WEAK_SECRETS.has(secret)) {
    fail("NEXTAUTH_SECRET is set to a publicly-known placeholder value.");
  }
}

// Run on import so any module that pulls in the auth layer triggers validation.
validateEnv();
