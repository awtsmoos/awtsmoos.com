<!-- B"H -->
# Dayuh Chadash synchronization

This is the canonical quick reference for the implemented custom-SSH database
synchronizer. The detailed runbooks live in `docs/operations/`.

## Production topology

```text
Repository:   /Users/awtsmoos/work/awtsmoos.com
Local DB:     /Users/awtsmoos/Documents/awtsmoos/dayuhChadash
Remote DB:    /mnt/HC_Volume_102267213/dayuhChadash
State:        /Users/awtsmoos/Documents/awtsmoos/.dayuh-sync/awtsmoos.com
Remote repo:  /mnt/HC_Volume_102267213/git/awtsmoos.com
Service:      awtsmoos.service
SSH:          root@awtsmoos.com:22
```

Always pass the production remote path explicitly. The code default is
`/root/dayuhChadash`, which is not the current production database.

## Safety rules

- Use `scripts/dayuh-sync.mjs` and `scripts/dayuh-seed.mjs` as the canonical tools.
- They use the repository Keter SSH/SFTP client, not OpenSSH, `scp`, or remote `rsync`.
- The password comes from `safeSshPasswordStore.mjs`; never print or copy it.
- Run `status` and a dry run before every write.
- Do not use `--delete` unless the owner approved the exact removal list.
- Production may contain valid server-only runtime records, including email data.
- Database sync and Git/code deployment are separate operations.

## Shell variables

```bash
cd /Users/awtsmoos/work/awtsmoos.com
LOCAL_DB=/Users/awtsmoos/Documents/awtsmoos/dayuhChadash
REMOTE_DB=/mnt/HC_Volume_102267213/dayuhChadash
STATE=/Users/awtsmoos/Documents/awtsmoos/.dayuh-sync/awtsmoos.com
```

## Inspect credentials without exposing them

```bash
npm run bh:ssh:info
```

Set the password only when the store is empty:

```bash
npm run bh:ssh:set-password
```

## Status and dry runs

```bash
node scripts/dayuh-sync.mjs status \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"

node scripts/dayuh-sync.mjs push --dry-run \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"

node scripts/dayuh-sync.mjs pull --dry-run \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
```

## Local to remote

```bash
node scripts/dayuh-sync.mjs push \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
```

This uploads changed or missing local files. It does not remove remote-only files
unless `--delete` is explicitly supplied.

## Remote to local

```bash
node scripts/dayuh-sync.mjs pull \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
```

This downloads changed or missing remote files. It does not remove local-only
files unless `--delete` is explicitly supplied.

## Bidirectional sync

Use only after a successful push or pull has established `base.json`:

```bash
node scripts/dayuh-sync.mjs sync \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
```

One-sided changes move toward the unchanged side. Two-sided changes are saved
under `.dayuh-conflicts` locally and the operation stops.

## Initial or disaster-recovery seed

Seed only from an immutable, verified snapshot:

```bash
node scripts/dayuh-seed.mjs seed \
	--local-root /path/to/snapshot/dayuhChadash \
	--remote-root "$REMOTE_DB" --state-root "$STATE"
```

The seed streams a compressed archive through custom SSH, verifies SHA-256,
extracts to an incoming directory, and atomically swaps the target with rollback.

## Required completion gates

1. A second `status` reports zero `push.upload` entries.
2. `push.removeRemote` is empty unless removals were explicitly approved.
3. `npm run bh:ssh -- --command "systemctl is-active awtsmoos.service"` reports active.
4. Public API smoke tests pass.
5. No seed or `.part` staging artifact remains.

See `docs/operations/README.md` for agent checklists, recovery, and Git guidance.
