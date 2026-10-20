B"H

# Bulk Import API — Agent Handoff

Import translated corpora (Tanach, Bavli, Mishnah, Yerushalmi, Rambam, Midrash, Torah Ohr…) as first-class native AwtsmoosDB posts, then verify them byte-exact. All routes are mounted under `/api/social`, so full paths are `/api/social/packed/import/...`.

**The one command that does almost everything:**
```bash
node ~/workspace/mw-repo/scripts/vmImportStaged.mjs --heichel <corpus> --posts-dir ~/workspace/bulk-import-fix/staging/<corpus>
```
It stages, uploads, starts the job, polls, and verifies. Read on for what happens underneath and how to recover when it breaks.

---

## 1. Endpoints

### Posts lane — `postImportRoutes.js`

| Method | Path | Params | What it does |
|---|---|---|---|
| POST | `/packed/import/posts/start` | `{uploadId}` (+ optional `heichelId`, `aliasId`, `aliasName`, `dryRun`, `timeBudgetMs`) or inline `{posts: [...]}` | Creates job `postimport_<ts>_<hex>`, runs it fire-and-forget. Inline ≤100 posts / ~2MB; larger corpora use a staged `uploadId` (see §3). Returns `{jobId, status:'queued', totalPosts, source}` |
| GET | `/packed/import/posts/status` | `?job=<id>` | `{id, status, live, heichelId, totalPosts, postsDone, wrote, updated, skipped, failed, errors(last 10), donePostIds, durationMs}`. Falls back to disk state when the in-memory job is gone (`live:false`) |
| GET | `/packed/import/posts/jobs` | — | Merged in-memory + disk list (max 50, newest first) |
| POST | `/packed/import/posts/cancel` | `{job}` | Sets `cancelRequested` on a **live** job only (disk-only job → `JOB_NOT_RUNNING`) |
| POST | `/packed/import/posts/verify` | `{uploadId, aliasId?, aliasName?}` | Starts background job `verify_<ts>_<hex>` that re-hashes every staged post against the live records. Returns `{verifyId, total}` |
| GET | `/packed/import/posts/verify-status` | `?verify=<id>` | `{status, checked, total, ok, mismatches(first 50), mismatchCount, durationMs}` |
| POST | `/packed/import/posts/ensure-backlinks` | `{uploadId}` | Job `backlinks_<ts>_<hex>` that writes **only missing** alias backlinks — never touches post bodies. Idempotent |
| GET | `/packed/import/posts/backlinks-status` | `?backlinks=<id>` | `{status, checked, total, written, skipped, errors}`. **Note:** this endpoint has no signed-op case — use operator-key auth (no `sig` fields) |
| POST | `/packed/import/posts/remove` | `{heichelId, postId, strayAliasId?}` | Deletes one wrongly-placed post: native record → alias backlink → series index entry → packed core tombstone (`op:'del'`). Optional `strayAliasId` also removes that alias's stray backlink + alias info. Returns `{removed:[...], existed}` |

### Bulk (comments) lane — `bulkImportRoutes.js`

A separate one-job lane for per-post comment files (not post documents):

| Method | Path | Params |
|---|---|---|
| POST | `/packed/import/bulk/start` | `{kind:'perPost'|'perPostIndex', seriesId?, postId?, aliasId?, heichelId?, dryRun?, items?\|payloadFile?, maxComments?, timeBudgetMs?}` |
| GET | `/packed/import/bulk/status` | `?job=<id>` (in-memory only, no disk fallback) |
| GET | `/packed/import/bulk/jobs` | — |
| POST | `/packed/import/bulk/cancel` | `{job}` |

### Stage upload — `bulkPublishAllRoutes.js`

| Method | Path | Params |
|---|---|---|
| POST | `/packed/import/bulk/stage` | signed `{uploadId, chunkIndex, totalChunks, data(base64)}` — stores `chunk-<N>.bin` under `<dbRoot>/socialPacked/bulk-stage/<uploadId>/`; idempotent, out-of-order safe; when all chunks land it assembles `upload.tar.gz`. Caps: chunk ≤4MB raw, assembled ≤2GB, totalChunks ≤100000 |

---

## 2. Auth — Ed25519 signing (`importSign.js`)

- **Private key:** `~/.awtsmoos/secure/import-signing-key` (chmod 600, VM only — never in git/chat). Override with `AWTSMOOS_IMPORT_KEY_FILE`. This is a **different keypair** from the deploy signer.
- **Public key:** baked into `importSign.js` (auditable in git, survives restarts).
- Wire format: JSON body carries `{ts, sig, op, heichelId, payloadHash, ...fields}`.
- The signature covers canonical bytes = sorted-key JSON of `{v:1, ts:Number, op:String, heichelId:String, payloadHash:String}`.
- Freshness ±300s; in-memory replay map rejects reused signatures. If no `sig` is present, the server falls back to `AWTSMOOS_IMPORT_KEY` (timing-safe compare) — a bad signature fails closed with no fallback.

**Exact `payloadHash` per op** (pass to `importSign.sha256hex`):

```js
'posts/start' (staged):  sha256hex(uploadId)
'posts/start' (inline):  sha256hex(JSON.stringify(posts))   // sign exactly what the framework parses
'posts/status' | 'posts/cancel': sha256hex('job:' + jobId)
'posts/jobs':            sha256hex('jobs')
'posts/verify':          sha256hex('verify:' + uploadId)
'posts/verify-status':   sha256hex('verify-status:' + verifyId)
'posts/ensure-backlinks':sha256hex('backlinks:' + uploadId)
'posts/remove':          sha256hex('remove:' + heichelId + ':' + postId)
'bulk/stage':            sha256hex(uploadId + ':' + chunkIndex + ':' + dataB64)
```

Minimal signed call (Node):
```js
const importSign = require('./geelooy/api/social/helper/routes/packed/importSign.js');
const privKey = require('fs').readFileSync(process.env.HOME + '/.awtsmoos/secure/import-signing-key', 'utf8');
const ts = String(Math.floor(Date.now()/1000));
const op = 'posts/status', heichelId = '';
const payloadHash = importSign.sha256hex('job:' + jobId);
const sig = importSign.signPayload(privKey, { ts, op, heichelId, payloadHash });
// GET /api/social/packed/import/posts/status?job=<jobId>&ts=<ts>&op=posts/status&payloadHash=<hash>&sig=<sig>
```

---

## 3. The standard import flow (`scripts/vmImportStaged.mjs`)

```bash
# Full run: stage → upload → import → verify
node scripts/vmImportStaged.mjs --heichel <corpus> --posts-dir ~/workspace/bulk-import-fix/staging/<corpus>

# Resume an interrupted run (state file is resumable):
node scripts/vmImportStaged.mjs --upload-id upl_xxxx_yyyy

# Verify only, no writes:
node scripts/vmImportStaged.mjs --heichel <corpus> --upload-id upl_xxxx_yyyy --verify-only

# Dry run (hashes live records, reports what would change):
node scripts/vmImportStaged.mjs --heichel <corpus> --posts-dir <dir> --dry-run
```

Flags: `--heichel` (default `'ikar'` — **override it; see §7**), `--posts-dir` (required for new imports), `--upload-id`, `--dry-run`, `--verify-only`, `--time-budget-ms` (default 20min, cap 60min). Env: `AWTSMOOS_IMPORT_KEY_FILE`, `AWTSMOOS_IMPORT_API` (default `https://awtsmoos.com/api/social`), `AWTSMOOS_IMPORT_WORKDIR` (default `~/workspace/bulk-import-fix/staging/work`).

What it does:
1. **Stage→tarball:** every `*.json` in `--posts-dir` → `stageDir/post_NNNNN.json`; writes `manifest.json` = `{files:[{file, postId, heichelId: doc.heichelId || <CLI --heichel>}], postCount}`; `tar -czf`.
2. **Chunked upload:** 1MB chunks, each a signed POST to `/packed/import/bulk/stage`; resume skips ACKed chunks (state in `import-state-<uploadId>.json`).
3. **Start:** signed POST `/packed/import/posts/start` `{uploadId, dryRun, timeBudgetMs}` → `{jobId}`.
4. **Poll:** signed GET `/status` every 15s. On `JOB_NOT_FOUND`/`interrupted`/`paused` it starts a **new** job — safe because the import skips already-imported posts by content hash. Max 50 restarts, 12h overall.
5. **Verify:** signed POST `/packed/import/posts/verify` + poll `verify-status`; mismatches saved to `verify-mismatches-<uploadId>.json`, exit 1 on any mismatch.

Canary pattern for a new corpus: import a small subset first (`--posts-dir` with a few files), confirm verify passes, then run the full set.

---

## 4. Concurrency, budgets, guards

- **One job at a time per lane.** `start` returns `JOB_ALREADY_RUNNING` if any job in the registry is `running`. Posts lane and bulk-comments lane have **separate** registries. Caveat: `verify_*`/`backlinks_*` jobs share the posts registry, so a running verify blocks a new import start.
- **Resume is idempotent:** re-running with the same `uploadId` skips posts whose content hash already matches (`skipped++`). After a server restart, live jobs are honestly reported as `interrupted` and the client starts a fresh job.
- **Time budget:** default 20min, cap 60min; expiry → `paused`, client resumes with a new job.
- **Heap guards:** new jobs refused above 1.2GB; mid-run breach → `PAUSED_MEMORY` + `paused`.
- **Import lock:** `<dbRoot>/socialPacked/import-in-progress.lock` — the deploy route refuses restarts while it's fresh. Never deploy/restart mid-finalize.
- **Bounds:** inline ≤100 posts / ~2MB; per-post 5MB; `uploadId` must match `/^[A-Za-z0-9_-]{8,64}$/`.

---

## 5. Verify semantics (byte-exact, not "HTTP 200")

For each manifest entry the server recomputes `expectedHash = contentHash(normalizePost(raw) + aliasId)` exactly as the import did, then checks three things in order:

1. **Packed:** one streaming pass over the core JSONL builds `{postId → liveHash}`; must equal expected.
2. **Native:** `/social/heichelos/<h>/posts/<postId>` must exist and hash-equal expected.
3. **Alias link:** `/social/aliases/<aliasId>/postsSubmitted/inHeichel/<h>/inSeries/<s>/<postId>` must exist.

The hash is sha256 over stable-key-order JSON **excluding only `importedAt` and `updatedAt`**. Everything else — `heichelId`, `aliasId`, `seriesId`, all content — is hashed.

| Problem | Meaning | Fix |
|---|---|---|
| `PACKED_HASH_MISMATCH` | Record exists, hash differs. **Most common cause: `--heichel` ≠ posts' `heichelId`** (see §7) | `POST /packed/import/posts/remove` the misplaced posts, re-import with matching `--heichel`. If content genuinely changed, re-import overwrites (`updated++`) |
| `PACKED_NOT_FOUND` / `NATIVE_NOT_FOUND` | Import incomplete | Re-run (idempotent resume skips done posts) |
| `NATIVE_HASH_MISMATCH` | Native record differs from staged doc | Re-run import |
| `ALIAS_LINK_MISSING` | Bodies fine, backlink absent | `POST /packed/import/posts/ensure-backlinks {uploadId}` — writes only missing links |

---

## 6. The alias model

- **One alias per commentator:** `deriveAliasId` = `<heichelId>-<slug(commentator)>` (slug = lowercase, `[^a-z0-9]+` → `-`). No commentator → job-level fallback alias.
- `ensureAlias` creates `/social/aliases/<aliasId>/info` (`{aliasId, name, kind:'commentator', createdAt, createdBy}`), `/profile`, and the alias→heichel link `/social/aliases/<aliasId>/heichelosContributedTo/<heichelId>` as an **object** `{aliasId, heichelId, linkedAt, by}` — never boolean `true` (booleans don't roundtrip through `$i.db.get`, which caused `ALIAS_LINK_MISSING`).
- `writeNativePost` writes the first-class records:
  - `/social/heichelos/<h>/posts/<pid>` = the post
  - `/social/aliases/<aliasId>/postsSubmitted/inHeichel/<h>/inSeries/<s>/<pid>` = `{postId, aliasId, heichelId, seriesId, linkedAt, by}`
- Series index `/social/heichelos/<h>/series/<s>/posts` accumulates in memory and flushes in bulk.
- The packed JSONL mirror (core/allPosts/manifest/search) is what readers serve; **native records are the system of record**.

---

## 7. ⚠️ CRITICAL — `--heichel` must equal the posts' `heichelId`

```js
// normalizePost: the RAW doc's heichelId wins
post.heichelId = post.heichelId || heichelId;
// runJob: but the alias is derived from the CLI/job heichelId
post.aliasId = this.postAliasId(post, spec.heichelId /* = CLI --heichel */, spec.aliasId);
// runVerify: and the verifier derives the alias from the MANIFEST heichelId
const h = entry.heichelId || v.heichelId;   // manifest entry (doc.heichelId || CLI --heichel)
post.aliasId = deriveAliasId(post.commentator, h, v.aliasId);
```

**Failure mode:** posts carry `heichelId:'tanach'` but you run `--heichel ikar` (the client default!). The import stores `heichelId='tanach'` (raw wins) but `aliasId='ikar-<slug>'` (job heichelId). The verifier recomputes `aliasId='tanach-<slug>'` → hash differs → **every post fails `PACKED_HASH_MISMATCH`**, with backlinks landing under the wrong alias.

**Rule: CLI `--heichel` MUST equal the posts' `heichelId`.** If they disagree: `POST /packed/import/posts/remove` each misplaced post (with `strayAliasId` to clean the wrong alias), then re-import with the correct `--heichel`.

---

## 8. Common errors

| Error | Fix |
|---|---|
| `SIG_BAD_TIMESTAMP` / `SIG_STALE_TIMESTAMP` | VM clock skew — must be within ±300s of server time |
| `SIG_REPLAYED_SIGNATURE` | Re-sign with a fresh `ts`; signatures are one-use |
| `SIG_PAYLOAD_MISMATCH` | `payloadHash` doesn't match the received payload — sign exactly what the framework parses |
| `SIG_BAD_OP` | Unknown op (note: `backlinks-status` has no signed-op case — use operator-key auth there) |
| `JOB_ALREADY_RUNNING` | Poll the live `jobId` via `/status`, or `/cancel` it |
| `INLINE_TOO_LARGE` | Use staged upload (`/packed/import/bulk/stage` + `uploadId`) |
| `POST_TOO_LARGE` | Post >5MB — split the document |
| `POST_NO_HEICHEL` | Pass `--heichel` |
| `BAD_UPLOAD_ID` | Must match `/^[A-Za-z0-9_-]{8,64}$/` |
| `TAR_*` / `MANIFEST_*` / `STAGED_FILE_MISSING` | Tarball must extract to flat `*.json` files + `manifest.json` (no `/`, `\`, `..` in entry names) |
| `SERVER_MEMORY_HIGH` / `PAUSED_MEMORY` | Heap >1.2GB — wait, retry/resume |
| `JOB_NOT_FOUND` / `VERIFY_NOT_FOUND` | Server restarted or state pruned (>7d) — start fresh; resume is idempotent |
| 502/503/504 | Server restarting — client retries with backoff |

## Files map

- `postImportRoutes.js` — posts lane (start/status/jobs/cancel/verify/verify-status/ensure-backlinks/backlinks-status/remove)
- `bulkImportRoutes.js` — bulk comments lane
- `bulkPublishAllRoutes.js` — chunked stage upload
- `importSign.js` — Ed25519 signing/verification (shared by client + server)
- `requestValues.js` — param helpers
- `../../packed/socialPacked.js` — packed mirror writers
- `../../packed/shardPaths.js` — `logicalKey`, shard layout
- `scripts/vmImportStaged.mjs` — the standard client
- `~/workspace/bulk-import-fix/vmVerifySigned.mjs`, `vmVerifyFull.mjs`, `vmDryRunVerify.mjs`, `pollJob.mjs`, `retryStart.mjs` — independent verify tooling

## Crash guards (2026-10-20)

The box is 2 GB. The 2026-10-20 hangs were event-loop starvation (no
OOM kills — Node was alive but wedged by sync disk flush + deflate
across up to 4 concurrent jobs x 4 workers), plus one bad shard swap.

- `eventLoopMonitor.js` — 1s loop-lag probe; p95/mean thresholds feed
  `shedNow()`/`circuitOpen()`. Started from `postImportRoutes.js`.
- `serverHealth.js` — `admissionHealthy()`: fail-fast /start gate
  (one job, heap <800 MB, OS free >200 MB, circuit closed). Refusals
  return instantly with `error` code + `retryAfterMs` — never a hang.
  New error codes: `IMPORT_BUSY`, `IMPORT_MEMORY_HIGH`,
  `IMPORT_CIRCUIT_OPEN`.
- `importBounds.js` — `MAX_CONCURRENT_PER_HEICHEL = 1` (was 4).
- `runJobWorkers.js` — workers pause 2s while `shedNow()` (circuit
  breaker); a job's `shedPauses` counter records how often.
- Health watchdog (systemd drop-in): restarts after 6 consecutive
  failed probes (~6 min), was 40 (~40 min).
- `shardSwapSafety/` — a shard file may only be replaced after its
  candidate copy passes `canaryCheck.js` (opens with production
  options, lists the root, reads a probe record). See its README.
