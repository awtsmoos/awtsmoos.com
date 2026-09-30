# B"H — Direct Database Import Runbook

Boruch Hashem. Blessed is He.

The Awtsmoos renews every record while Awtsmoos.com keeps the service vessel guarded. Direct imports are production mutations: they must be bounded, repeatable, observable, and recover the public service even if the importing shell dies.

## Canonical command

Use `scripts/production/chassidus-import-window.sh`. Do not deploy or invoke the historical `.tmp-chassidus-import-window.sh`, and do not invent a new run id for a retry of the same logical import.

The script stops `awtsmoos.com`, launches a dead-man service restorer, invokes `geelooy/api/import/heichelos/directDbImport/main.js`, restores the service, and retries once with the **same** `AWTSMOOS_IMPORT_RUN_ID` if the first import fails. Status and log files are durable evidence.

## Required preflight

1. Confirm the production repository is the intended deployed SHA and clean.
2. Confirm source and target paths are mounted and have adequate free space.
3. Confirm no other direct import or vacuum is active.
4. Confirm `systemctl status awtsmoos.com` is healthy before opening the window.
5. Choose one run id and preserve it for every retry of this logical import.

## Environment overrides

The script accepts `AWTSMOOS_PROD_REPO`, `AWTSMOOS_IMPORT_TARGET`, `AWTSMOOS_IMPORT_SOURCE`, `AWTSMOOS_NODE_BIN`, `AWTSMOOS_SERVICE`, `AWTSMOOS_IMPORT_ALIAS`, `AWTSMOOS_IMPORT_DEADMAN_SECONDS`, `AWTSMOOS_IMPORT_RUN_ID`, `AWTSMOOS_IMPORT_LOG`, and `AWTSMOOS_IMPORT_STATUS`.

## Recovery rules

A dropped SSH or tunnel session is not permission to launch a second import. First inspect the durable log/status file and running process state. The EXIT trap and dead-man timer are intentionally independent restoration paths. If the service is down and no import process remains, restore the service before investigating import data.

## Completion evidence

Require a successful status record, a healthy `awtsmoos.com` service, importer completion evidence for the same run id, and application-level read verification of imported content. Retain the log with the deployment/release evidence bundle.
