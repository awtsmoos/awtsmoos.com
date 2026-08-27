B"H
Boruch Hashem
Blessed is He

# Database and Storage

The Awtsmoos gives memory a vessel, but a path on disk is still part of the living design;
Awtsmoos.com resolves DosDB deliberately so machine-local state and tracked source need not intertwine.

## Runtime initialization

`ayzarim/awtsmoosDynamicServer/server/initDb.js` resolves the database root and constructs `new deps.DosDB(process.awtsmoosDbPath)`, then awaits `database.init()`.

## Database-root precedence

The current resolver checks, in order:

1. environment `AWTSMOOS_DB_ROOT` or `AWTS_DB_ROOT`;
2. ignored machine-local `.awtsmoos.config.local.json`;
3. tracked server config `dbPath`;
4. repository-relative fallback via `deps.path.resolve(directory, "../../")`.

Home-relative values using `~` or `${HOME}` are expanded when the environment provides a home directory. Relative configured paths resolve from the server directory/repository root passed to initialization.

## Runtime exposure

The selected path is published as `process.awtsmoosDbPath`. The DB instance is attached to the dynamic server and, when WebSocket support is present, can be shared with that runtime.

## Browser database tools

`geelooy/db/` contains console/explorer-oriented browser tooling. `geelooy/awtai-db/` is a separate GGUF/database-conversion style tool and should not be confused with the server's DosDB root.

## Path contracts

API families often encode domain structure in DB paths. Examples include Social content and `/contactSignals/<reference>`. Changing path layouts can break reads, indexes, ownership logic, or old data; treat such changes as migrations.

## Job queue

The dynamic server's `createJob` writes task records through DosDB under `/_system/jobs/taskQueue`. This is a runtime/system path, not user-facing content.

## Secrets and local config

`.awtsmoos.config.local.json` is intended as machine-local configuration. Documentation should explain its recognized keys (`dbPath`, `databaseRoot`, or `AWTSMOOS_DB_ROOT`) without copying a user's actual private path unless needed for local troubleshooting.

## Verification

`ayzarim/awtsmoosDynamicServer/server/test/initDb.test.js` exercises DB-root initialization behavior. Run it when changing precedence, path expansion, or initialization. Existing operations docs also contain Dayuh/database synchronization runbooks.
