B"H
Boruch Hashem
Blessed is He

# Database 101

## What you will learn

How the server establishes DosDB, why persisted paths are compatibility contracts, and how route code receives shared database context.

## Main initialization

`ayzarim/awtsmoosDynamicServer/server/initDb.js` selects the DB root and stores the initialized DosDB on shared runtime context.

## Root precedence

Current documented precedence is environment override → machine-local ignored config → tracked config → repository fallback. Inspect the initializer before relying on exact variable/file names.

## Why paths matter

Social, Sefarim, contact signals, identity/account state, and many older systems encode behavior in path shapes. Renaming a path can be a migration, not a refactor.

## Safe workflow

1. Find every reader and writer of the path.
2. Check legacy/new storage adapters.
3. Find migration scripts/tests.
4. Decide compatibility/fallback order.
5. Back up or snapshot before mutation tooling.
6. Update docs when persisted contracts change.

## Evidence

Use `docs/DATA/`, `docs/SYSTEMS/DATABASE_AND_STORAGE.md`, generated dependency/project indexes, and the exact route source.

## Never infer

An environment name mentioning DB does not necessarily control the main DosDB instance; generator classification is advisory.
