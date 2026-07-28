<!-- B"H -->
# Awtsmoos production operations

This directory is the future-agent entry point for database synchronization and
code deployment. Read the relevant guide before changing production.

## Current production topology

| Component | Path or value |
|---|---|
| Local repository | `/Users/awtsmoos/work/awtsmoos.com` |
| Local Dayuh Chadash | `/Users/awtsmoos/Documents/awtsmoos/dayuhChadash` |
| Remote Dayuh Chadash | `/mnt/HC_Volume_102267213/dayuhChadash` |
| Local sync state | `/Users/awtsmoos/Documents/awtsmoos/.dayuh-sync/awtsmoos.com` |
| Remote repository | `/mnt/HC_Volume_102267213/git/awtsmoos.com` |
| Production service | `awtsmoos.service` |
| SSH endpoint | `root@awtsmoos.com:22` |

The production remote database is **not** `/root/dayuhChadash`. Always pass the
remote path explicitly to sync and seed commands.

## Guides

- [`dayuh-database-sync-runbook.md`](dayuh-database-sync-runbook.md): exact
  local-to-remote, remote-to-local, bidirectional, seed, and verification commands.
- [`dayuh-agent-checklist.md`](dayuh-agent-checklist.md): mandatory preflight,
  execution, and completion checklist for AI agents.
- [`dayuh-recovery-and-conflicts.md`](dayuh-recovery-and-conflicts.md): stale
  locks, conflicts, interrupted transfers, seed staging, and rollback.
- [`dayuh-code-deploy-and-git.md`](dayuh-code-deploy-and-git.md): separation of
  database sync, Git publication, remote code deployment, and service restart.
- [`../../scripts/DAYUH_SYNC.md`](../../scripts/DAYUH_SYNC.md): concise command
  reference beside the implementation.

## Non-negotiable boundaries

1. Use the repository custom SSH client; do not substitute OpenSSH, `scp`, or
   remote `rsync` for production transfer.
2. Never reveal the SSH password. Inspect only its credential descriptor.
3. Run `status` and `--dry-run` before every database write.
4. Do not use `--delete` without explicit owner approval of the exact paths.
5. Preserve legitimate remote-only runtime files, including email-thread data.
6. Do not run `npm run bh` or `npm run ship` casually: `ship.mjs` stages all files.
7. Do not commit or push unless the owner explicitly requests it.
8. Verify the remote service and public API after every production operation.

## Last known verified state

On 2026-07-26 the deployment was verified with:

- `awtsmoos.service` active in the production repository;
- three public RAG lanes;
- Middot phrase counts `8 / 8 / 14 / 30` for the representative post;
- 766 series, 11,366 unique posts, and zero local/public series mismatches;
- zero pending local database uploads after the final push;
- intentional remote-only runtime records preserved.

This record is historical evidence, not a substitute for a fresh verification.
