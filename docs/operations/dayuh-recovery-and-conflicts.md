B"H
Boruch Hashem
Blessed is He

# Dayuh sync recovery and conflict handling

Use this guide only after reading the main runbook. Recovery must preserve the
current database until the failed stage is understood.

## Remote paths

For the production database:

```text
Database:       /mnt/HC_Volume_102267213/dayuhChadash
Remote state:   /mnt/HC_Volume_102267213/dayuhChadash.awtsmoos-sync
Lock:           /mnt/HC_Volume_102267213/dayuhChadash.awtsmoos-sync/lock
Seed archive:   /mnt/HC_Volume_102267213/dayuhChadash.awtsmoos-sync/seed.tar.gz.part
Incoming seed:  /mnt/HC_Volume_102267213/dayuhChadash.incoming-seed
Previous seed:  /mnt/HC_Volume_102267213/dayuhChadash.previous-seed
```

Do not use paths from older `/root/dayuhChadash` deployments when inspecting the
current production service.

## Stale lock

A lock prevents concurrent sync operations. A timeout in the tunnel UI does not
prove the worker stopped.

1. Search local processes for `dayuh-sync.mjs` and `dayuh-seed.mjs`.
2. Inspect tunnel durable jobs and process-family receipts.
3. Through custom SSH, inspect the remote lock and relevant processes.
4. Clear the lock only when no operation can still own it.
5. Rerun with `--force` only after that proof.

`--force` removes the remote lock before acquiring a new one. It does not repair
an active or partially completed transfer.

## Interrupted changed-file transfer

The SFTP layer writes temporary files and renames them after verification.
After interruption:

1. Do not manually copy the partial file over the target.
2. Run `status` again; manifests will identify the incomplete path.
3. Inspect `.part` files only through custom SSH.
4. Remove a proven orphaned temporary file, never the verified target.
5. Rerun the same push or pull without `--delete`.
6. Run `status` again and require zero pending uploads for a push.

## Sync conflict

Three-way `sync` compares local and remote manifests with the last common
`base.json`. When both sides changed one path:

- the remote version is copied under
  `../.dayuh-conflicts/<timestamp>/<relative-path>` locally;
- the operation reports the conflict and stops;
- neither side is silently overwritten.

Resolve by comparing the local file, remote conflict copy, and application
semantics. Write the chosen result to one side, then use a directional push or
pull to establish a new common base.

## Interrupted seed

The seed process owns the incoming, previous, and archive paths. It verifies the
compressed archive SHA-256 before extraction. During the swap, a trap restores
the previous target when the new target was not installed.

Recovery sequence:

1. Confirm whether the seed process is still alive.
2. Confirm whether the active database path exists.
3. If the active path exists and the service is healthy, do not move it.
4. Inspect the incoming, previous, and archive paths.
5. Preserve a previous seed until target health is proven.
6. Remove only artifacts proven to be abandoned.
7. Prefer a changed-only push after a successful target install; do not reseed
   several gigabytes merely because final verification failed.

Never manually delete the active database root during recovery.

## Remote-only runtime data

A status report can show downloads even when every local change is published.
This means production has files not present locally or has newer versions.
Examples can include email threads, queues, sessions, moderation state, or other
runtime records.

- Preserve them by omitting `--delete` from push.
- Pull them only when local should become a replica of production.
- Do not classify them as stale based only on directory name.
- Record preserved remote-only paths in the operation report.

## Service recovery

Inspect through the custom SSH CLI:

```bash
npm run bh:ssh -- --command \
	"systemctl status awtsmoos.service --no-pager && systemctl show awtsmoos.service -p MainPID"
```

Restart only when required by code or database lifecycle rules:

```bash
npm run bh:ssh -- --command \
	"systemctl restart awtsmoos.service && systemctl is-active awtsmoos.service"
```

After restart, verify the PID working directory, the RAG catalog endpoint, and a
representative content endpoint. A running process alone is not completion.
