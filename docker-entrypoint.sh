#!/bin/sh
set -e

# Prefer a real migration history when one exists (safe, versioned, no data loss).
# Fall back to `db push` WITHOUT --accept-data-loss so a schema drift can never
# silently drop columns or destroy data in production — it will refuse instead.
if [ -d "./prisma/migrations" ] && [ -n "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  echo "→ Applying migrations (prisma migrate deploy)…"
  node_modules/.bin/prisma migrate deploy || {
    echo "⚠ prisma migrate deploy failed (is DATABASE_URL reachable?)" >&2
  }
else
  echo "→ Syncing schema (prisma db push)…"
  node_modules/.bin/prisma db push --skip-generate || {
    echo "⚠ prisma db push failed or refused a destructive change — review the schema." >&2
  }
fi

echo "→ Starting AgoyType…"
exec "$@"
