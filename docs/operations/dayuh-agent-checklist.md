B"H
Boruch Hashem
Blessed is He

# Dayuh sync checklist for AI agents

This checklist is mandatory for production database work. Do not skip directly
to a write command.

## Preflight

- [ ] Read `scripts/DAYUH_SYNC.md` and the database sync runbook.
- [ ] `cd /Users/awtsmoos/work/awtsmoos.com`.
- [ ] Run `git status --short` and note unrelated worktree changes.
- [ ] Confirm the local database path exists.
- [ ] Confirm the remote path is exactly
      `/mnt/HC_Volume_102267213/dayuhChadash`.
- [ ] Run `npm run bh:ssh:info`; do not reveal the secret value.
- [ ] Confirm no other seed or sync process is active.
- [ ] Run a read-only `status` with explicit local, remote, and state paths.
- [ ] Save the exact upload, download, and removal lists in the operation report.

## Direction decision

Choose one operation only:

- **Push:** the current local database is authoritative for selected changes.
- **Pull:** production contains authoritative changes that local needs.
- **Sync:** both sides legitimately changed since a known common base.
- **Seed:** the remote database must be created or fully replaced from a verified
  immutable snapshot.

Do not infer authority from timestamps alone. Inspect the actual changed paths
and, when needed, compare API behavior or file hashes.

## Dry-run gate

- [ ] Run the matching operation with `--dry-run`.
- [ ] Review every changed path.
- [ ] Treat remote-only email, queue, session, and runtime records as potentially valid.
- [ ] Do not add `--delete` unless the owner approved the exact removal list.
- [ ] Do not add `--force` unless a lock was proven stale.
- [ ] For `sync`, confirm `base.json` came from a successful prior push or pull.
- [ ] For `seed`, confirm the source snapshot is immutable and complete.

## Write gate

- [ ] Run the canonical Node command, not a substitute transfer tool.
- [ ] Keep the explicit production remote path in the command.
- [ ] Do not use OpenSSH, `scp`, or remote `rsync` for production transfer.
- [ ] Do not print or pass the password on the command line.
- [ ] Do not manually edit the remote database while the operation is active.
- [ ] Do not start a duplicate operation because a tunnel status request timed out.
- [ ] Follow the existing durable job until it exits.

## Post-write verification

- [ ] Run `status` again.
- [ ] Require zero pending `push.upload` entries after a push.
- [ ] Require zero unapproved `push.removeRemote` entries.
- [ ] Verify downloaded files by the tool's SHA-256 checks after a pull.
- [ ] Confirm the remote lock is gone.
- [ ] Confirm no `.part`, `.incoming-seed`, or `.previous-seed` artifact remains.
- [ ] Verify `awtsmoos.service` is active through `npm run bh:ssh`.
- [ ] Verify the service working directory is the production repository.
- [ ] Run the RAG catalog API smoke.
- [ ] Run a representative content endpoint for the data that changed.
- [ ] When frontend structure changed, run a fresh browser test with cache disabled.

## Git and code boundary

- [ ] Do not place Dayuh Chadash database files in Git.
- [ ] Do not run `npm run bh` or `npm run ship` in a dirty shared worktree.
- [ ] Remember that `scripts/ship.mjs` stages all files with `git add .`.
- [ ] Commit only when explicitly requested by the owner.
- [ ] Stage exact files, inspect the cached list, then commit and push.
- [ ] Database synchronization does not prove code deployment, and code deployment
      does not prove database synchronization.

## Required final report

Record:

1. direction and exact roots;
2. dry-run counts and reviewed paths;
3. transferred and preserved files;
4. post-operation status counts;
5. remote service PID and working directory;
6. public API and browser results;
7. backup, conflict, or rollback locations;
8. relevant Git status and whether anything was committed.
