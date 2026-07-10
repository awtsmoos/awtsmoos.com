# B"H — dayuhChadash incremental SSH sync

This tool uses `ayzarim/ssh/Keter-Client.js` and its SFTP implementation. It does not invoke system `ssh`, `scp`, or `rsync`.

## Safety

- SHA-256 decides whether a file changed.
- Uploads are written to `*.awtsmoos-part` and renamed atomically.
- Remote deletion is off unless `--delete` is given.
- WAL, reader-lock, and transient lock files are excluded.
- A real sync refuses active database readers. Stop the local server before pushing database files, or prepare a stable snapshot and point `localRoot` at that snapshot.
- Credentials belong in environment variables, not the JSON config.

## Configure

Copy `dayuh-sync.example.json` to a private file such as `dayuh-sync.json`, then set:

```bash
export AWTSMOOS_SYNC_HOST='server.example.com'
export AWTSMOOS_SYNC_USER='deploy'
export AWTSMOOS_SYNC_PASSWORD='...'
```

Private-key authentication can use `AWTSMOOS_SYNC_PRIVATE_KEY` and optionally `AWTSMOOS_SYNC_PASSPHRASE`.

## Commands

```bash
node scripts/dayuh_sync/cli.js plan-push --config dayuh-sync.json
node scripts/dayuh_sync/cli.js push --config dayuh-sync.json
node scripts/dayuh_sync/cli.js plan-pull --config dayuh-sync.json
node scripts/dayuh_sync/cli.js pull --config dayuh-sync.json
node scripts/dayuh_sync/cli.js watch --config dayuh-sync.json --interval 30
```

`watch` checks repeatedly and sends only files whose hashes changed. It never deletes remote files.

## Isolated verification

```bash
node scripts/dayuh_sync/test/sync.test.js
```

The test uses temporary local directories as both ends and verifies initial push, no-op repeat, one-file update, and pull restoration.
