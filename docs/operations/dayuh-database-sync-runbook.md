B"H
Boruch Hashem
Blessed is He

# Dayuh Chadash database sync runbook
Use `scripts/dayuh-sync.mjs` for incremental transfer and
`scripts/dayuh-seed.mjs` only for a full snapshot replacement.

## Production variables
```bash
cd /Users/awtsmoos/work/awtsmoos.com
LOCAL_DB=/Users/awtsmoos/Documents/awtsmoos/dayuhChadash
REMOTE_DB=/mnt/HC_Volume_102267213/dayuhChadash
STATE=/Users/awtsmoos/Documents/awtsmoos/.dayuh-sync/awtsmoos.com
```
Always pass `--remote-root`. The code default `/root/dayuhChadash` is not the
current production database.

## Credential preflight
```bash
npm run bh:ssh:info
```
The password comes from the OS credential store or `AWTSMOOS_SSH_PASSWORD`.
Never echo it or place it in commands, logs, Git files, docs, or chat.

## Read-only status
```bash
node scripts/dayuh-sync.mjs status \
	--local-root "$LOCAL_DB" \
	--remote-root "$REMOTE_DB" \
	--state-root "$STATE"
```
The report means:
- `push.upload`: local files different from or absent on remote;
- `pull.download`: remote files different from or absent locally;
- removal lists appear only for delete planning.

Remote-only files may be valid runtime data. Production has previously contained
email-thread records that were intentionally preserved.

## Local to remote
```bash
node scripts/dayuh-sync.mjs push --dry-run \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
node scripts/dayuh-sync.mjs push \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
```
The push uploads four files concurrently, writes temporary names, verifies size
and SHA-256, then atomically renames. Without `--delete`, remote-only files stay.

## Remote to local
```bash
node scripts/dayuh-sync.mjs pull --dry-run \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
node scripts/dayuh-sync.mjs pull \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
```
Downloaded files are SHA-256 verified. Without `--delete`, local-only files stay.

## Bidirectional sync
Use only after a successful push or pull created the common `base.json`:
```bash
node scripts/dayuh-sync.mjs sync --dry-run \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
node scripts/dayuh-sync.mjs sync \
	--local-root "$LOCAL_DB" --remote-root "$REMOTE_DB" --state-root "$STATE"
```
One-sided changes move to the unchanged side. Two-sided changes are preserved
under `../.dayuh-conflicts/<timestamp>/...`, and sync stops.

## Deletion policy
Never use `--delete` routinely. It is allowed only when:
1. the owner approved the exact removal list;
2. a dry run exposed every path;
3. a backup or verified reverse path exists;
4. the service can tolerate the removal.

## Initial or recovery seed
Seed from an immutable, verified snapshot only:
```bash
node scripts/dayuh-seed.mjs seed \
	--local-root /path/to/immutable/dayuhChadash \
	--remote-root "$REMOTE_DB" \
	--state-root "$STATE"
```
The seed streams through custom SSH, verifies archive SHA-256, extracts to an
incoming directory, and atomically swaps the target with rollback. Never seed
from a database changing during archive creation.

## Completion gates
1. Repeat `status`; require zero `push.upload` entries after a push.
2. Require zero unapproved removals.
3. Confirm the remote lock and staging artifacts are gone.
4. Verify the service through the custom SSH CLI:
```bash
npm run bh:ssh -- --command "systemctl is-active awtsmoos.service"
```
5. Verify the public RAG catalog and a representative changed-content endpoint:
```bash
curl -fsS https://awtsmoos.com/api/social/search/library/shards
```
Use the agent checklist for the mandatory execution sequence and final report.
