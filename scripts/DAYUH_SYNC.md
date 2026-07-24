<!-- B"H -->
# Dayuh Chadash remote synchronization

This system uses the repository's custom Keter SSH client. It does not invoke
OpenSSH, `scp`, or remote `rsync`. The SSH password remains in the operating
system credential store used by `npm run bh`.

## Defaults

- Local database: `~/Documents/awtsmoos/dayuhChadash`
- Remote database: `/root/dayuhChadash`
- Host: `awtsmoos.com`
- User: `root`
- Local state: `~/Documents/awtsmoos/.dayuh-sync/awtsmoos.com`
- Remote state: `/root/dayuhChadash.awtsmoos-sync`

Every path can be overridden with `--local-root`, `--remote-root`,
`--state-root`, `--host`, `--user`, or `--port`.

## Initial seed

Create a consistent local snapshot first, then run:

```bash
node scripts/dayuh-seed.mjs seed \
	--local-root /path/to/immutable/dayuhChadash \
	--remote-root /root/dayuhChadash
```

The seed is a compressed tar stream sent through one flow-controlled custom SSH
exec channel. The remote host verifies SHA-256, extracts into an incoming
folder, and atomically swaps it into place. A previous target is retained until
the new extraction is installed successfully.

## Changed-only push

```bash
node scripts/dayuh-sync.mjs push --delete
```

Only files whose SHA-256 differs are streamed. `--delete` removes remote files
that no longer exist locally. Each file is written to a temporary name, size
checked, and atomically renamed.

## Pull remote changes

```bash
node scripts/dayuh-sync.mjs pull --delete
```

Only changed remote files are downloaded. Every downloaded file is SHA-256
verified before the operation completes.

## Bidirectional sync

```bash
node scripts/dayuh-sync.mjs sync
```

The sync compares local and remote manifests against the last common base.
One-sided changes move in the appropriate direction. If both sides changed the
same path, the remote copy is preserved under `.dayuh-conflicts` locally and
sync stops instead of overwriting either version.

## Inspection and dry runs

```bash
node scripts/dayuh-sync.mjs status
node scripts/dayuh-sync.mjs push --dry-run --delete
node scripts/dayuh-sync.mjs pull --dry-run --delete
node scripts/dayuh-sync.mjs sync --dry-run
```

## Locks and interrupted operations

The remote state directory contains a lock while a sync is active. A verified
stale lock can be cleared by rerunning with `--force`. Seed staging names are:

- `/root/dayuhChadash.awtsmoos-sync/seed.tar.gz.part`
- `/root/dayuhChadash.incoming-seed`
- `/root/dayuhChadash.previous-seed`

Never remove `/root/dayuhChadash` during recovery. The seed swap and rollback
logic owns that path.

## Verification

A production deployment is complete only when:

1. The seed reports `seed-complete`.
2. A changed-only push reports zero remaining uploads after verification.
3. Local and remote manifest file counts match.
4. No `.part`, `.incoming-seed`, or `.previous-seed` artifact remains.
5. The local production API remains healthy.
