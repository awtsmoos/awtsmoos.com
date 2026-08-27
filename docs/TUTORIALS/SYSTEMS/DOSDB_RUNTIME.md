B"H
Boruch Hashem
Blessed is He

# Tutorial: DosDB Runtime

The dynamic server initializes DosDB once and shares the instance through request/server context.

## Root selection

Environment overrides and local/tracked configuration participate in DB-root selection before repository fallback. Inspect `server/initDb.js` for current precedence.

## Why runtime paths matter

Many APIs encode compatibility in database path shapes. Sefarim reads directly from the shared DB; Social has multiple generations/adapters/migrations.

## Safe changes

Trace every writer/reader, migration, and fallback before changing a persisted path. Tests should cover old and new forms when compatibility is promised.

Read `docs/DATA/README.md` and `docs/DATA/PATH_CONTRACTS.md`.
