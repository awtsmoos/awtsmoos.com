B"H

# Scripts — Deploy & Import Clients (Agent Handoff)

VM-side tooling for the two things agents do most: **deploy code** and **import content**. No Mac, no SSH, no GitHub credentials needed — everything goes over Ed25519-signed HTTPS.

> **Stale-doc warning:** `VM_DEPLOY_API.md` describes the OLD shared-secret scheme (`vmDeploy.mjs`, `AWTSMOOS_DEPLOY_KEY`). That path is **gone** — the code now uses `vmDeploySigned.mjs` + Ed25519 only. Its "what needs a restart" section is still accurate.

---

## 1. Deploy — `vmDeploySigned.mjs`

Pushes repo files straight to production over signed HTTPS.

```bash
cd ~/workspace/mw-repo

# Health / config (unauthenticated):
node scripts/vmDeploySigned.mjs --status

# Single file:
node scripts/vmDeploySigned.mjs --message 'B"H fix reader CSS' \
  geelooy/heichelos/post/styles/meluket-sefer.css

# Multiple files:
node scripts/vmDeploySigned.mjs --message 'B"H reader fix batch' \
  geelooy/heichelos/post/_awtsmoos.post.html \
  geelooy/heichelos/post/styles/meluket-sefer.css

# Everything git shows as changed:
node scripts/vmDeploySigned.mjs --diff --message 'B"H batch fix'

# >50 files: split into ≤50-file chunks:
git status --porcelain | awk '{print $2}' | xargs -n 50 \
  node scripts/vmDeploySigned.mjs --message 'B"H chunk'

# Signed service restart (needed after server-side Node changes):
node scripts/vmDeploySigned.mjs --restart
```

**Signing:** private key `~/.awtsmoos/secure/deploy-signing-key` (Ed25519, chmod 600; override `AWTSMOOS_SIGNING_KEY_FILE`). Public key baked into `geelooy/api/social/helper/routes/packed/deploySign.js`. Signature covers canonical `{v:1, ts, message, files}`; ±300s freshness; replay-protected. Endpoint default `https://awtsmoos.com/api/social` (override `AWTSMOOS_DEPLOY_API`).

**Deployable roots** (`geelooy/api/social/helper/routes/packed/deployRoutes.js`): `geelooy/`, `scripts/`, `ops/`, `index.js`, `index.html`. **`ayzarim/` is NOT deployable** via this route ("Path not in deployable roots"). Blocked segments anywhere in a path: `.git`, `node_modules`, `.awtsmoos`, `.ssh`, `.env*`. Caps: 5MB/file, **50 files per push** (client does not chunk — you must).

**Do you need `--restart`?** HTML/CSS/client-JS/templates are picked up on the next request — **no restart**. Server-side Node (`geelooy/api/...`, including the deploy routes themselves) **requires** a restart. During restart nginx returns 502 — expected; poll `--status` until the API answers. **Never restart during a bulk-import finalize** (the deploy route refuses with `IMPORT_IN_PROGRESS`; the client auto-retries 8× with backoff on 502/503/504 and on `IMPORT_IN_PROGRESS`).

**Per-file results:** if some files succeed the response is `success:true` with an `errors[]` list; `ALL_FAILED` only when zero wrote. Audit trail: `<dbRoot>/socialPacked/deploy-api.log` on production.

**Typical route-change flow:**
```bash
node scripts/vmDeploySigned.mjs --message 'B"H api fix' geelooy/api/social/helper/routes/packed/deployRoutes.js
node scripts/vmDeploySigned.mjs --restart
node scripts/vmDeploySigned.mjs --status   # poll until 200
```

---

## 2. Import — `vmImportStaged.mjs`

The standard bulk-import client. Full docs in `geelooy/api/social/helper/routes/packed/README.md` §3.

```bash
# Full run: stage → chunked upload → import job → poll → byte-exact verify
node scripts/vmImportStaged.mjs --heichel <corpus> --posts-dir ~/workspace/bulk-import-fix/staging/<corpus>

# Resume / verify-only / dry-run
node scripts/vmImportStaged.mjs --upload-id upl_xxxx_yyyy
node scripts/vmImportStaged.mjs --heichel <corpus> --upload-id upl_xxxx_yyyy --verify-only
node scripts/vmImportStaged.mjs --heichel <corpus> --posts-dir <dir> --dry-run
```

**⚠️ `--heichel` must equal the `heichelId` inside your post JSONs** or verification fails with `PACKED_HASH_MISMATCH` (see packed README §7). Signing key: `~/.awtsmoos/secure/import-signing-key` (`AWTSMOOS_IMPORT_KEY_FILE`).

---

## 3. Production shell — `hetznerTunnel.mjs`

Run commands and read logs on the production box over signed HTTPS (uses the **import** signing key, not the deploy key).

```bash
node scripts/hetznerTunnel.mjs health
node scripts/hetznerTunnel.mjs exec "systemctl --user status awtsmoos" [--timeout 60000] [--cwd /path]
node scripts/hetznerTunnel.mjs readlog <name> [--lines 100]
```

`exec` returns stdout/stderr/exitCode/timedOut/durationMs and exits with the command's exit code.

---

## 4. Verify tooling (`~/workspace/bulk-import-fix/`, outside the repo)

| Script | Purpose |
|---|---|
| `vmVerifySigned.mjs <uploadId> --poll` | Signed `/packed/import/posts/verify` + poll |
| `vmVerifyFull.mjs` | Byte-exact: `normalizePost`/`contentHash` vs live bodies (adapt `SRC` per corpus) |
| `vmDryRunVerify.mjs <uploadId>` | Dry-run import: re-hashes live, reports skipped vs wrote |
| `pollJob.mjs <jobId>` | Poll an import job to terminal state |
| `retryStart.mjs <uploadId> [heichelId]` | Re-issue `posts/start` for an already-staged upload (**pass heichelId explicitly** — default is `ikar`) |
| `vmBacklinksSigned.mjs` | Run `ensure-backlinks` for an upload |

---

## 5. Common errors

| Error | Fix |
|---|---|
| `signing key not found` | Restore the key at `~/.awtsmoos/secure/<name>` (chmod 600) or set the `*_KEY_FILE` env var |
| `STALE_TIMESTAMP` / `FORBIDDEN` | VM clock skew — sync NTP (±300s window) |
| `BAD_SIGNATURE` | Keypair mismatch — verify against the baked-in public key |
| `REPLAYED_SIGNATURE` | Fresh request, new `ts` |
| `Path not in deployable roots` | Only `geelooy/`, `scripts/`, `ops/`, `index.js`, `index.html` are deployable |
| `TOO_MANY_FILES` | Split into ≤50-file pushes |
| `File exceeds ... bytes` | 5MB/file cap |
| `IMPORT_IN_PROGRESS` | Bulk-import finalize holds the lock — wait; client auto-retries |
| 502/503/504 | Restarting or nginx blip — client retries; poll `--status` |
| `RESTART_FAILED` | Diagnose via `hetznerTunnel.mjs exec "systemctl --user status awtsmoos"` |
| Deployed but server change not live | Server-side Node needs `--restart` after the push |
