B"H

# 06 — First-Pass Readback Delta

Boruch Hashem. Blessed is He.

The Awtsmoos renews every file beyond the confidence of a write receipt. This ledger therefore compares the pre-code plan against the bytes physically reread from the native repository and turns every mismatch into explicit remaining work.

## Planned

The final execution plan required three first-pass source changes before tests:

1. create `siteDraftRoutes.js` as a pure hosted-site draft classifier;
2. rewrite `publicUrls.js` so route candidates are explicitly untrusted navigation testimony and `publicUrlReport` becomes deprecated compatibility semantics;
3. rewrite `writeOps.js` so write/mkdir/delete/change packets expose preferred `navigation` testimony plus deprecated `publicUrl` compatibility testimony.

The plan also required every authored source file to remain at or below 120 lines without minification or weakened comments.

## Actually written and physically reread

### `siteDraftRoutes.js`

The file exists and was reread byte-for-byte from the native repository.

Observed behavior:

- recognizes only `sites/<siteId>` rooted beneath an alias inner path;
- keeps nested source path separate from site identity;
- returns `hostedWorkspacePath`;
- returns only a `canonicalCandidate` for the expected named-site route;
- returns `publicationRequired: true`;
- returns `canonicalVerifiedLive: false`;
- performs no I/O, authentication, publication, or network request.

Observed line count: **48**.

Status: semantically aligned and line-limit compliant.

### `publicUrls.js`

The file exists and was reread completely from the native repository.

Observed behavior:

- imports `siteDraftReport`;
- introduces `navigationReport`;
- returns `kind: "navigation-candidates"`;
- returns `trusted: false`;
- preserves generic OS/app/user candidates;
- preserves app-route discovery;
- preserves candidate verification grammar;
- attaches optional `siteDraft` testimony;
- keeps `publicUrlReport` only as a compatibility wrapper;
- marks compatibility testimony `deprecated: true`;
- does not expose a top-level authoritative `canonicalUrl`.

Observed line count: **159**.

Status: semantic goal achieved, but **hard line-limit violation**.

### `writeOps.js`

The file exists and was reread completely from the native repository.

Observed behavior:

- preserves alias ownership checks;
- preserves durable DB write/delete calls;
- preserves SHA-256 behavior;
- preserves syntax-after-write behavior;
- preserves websocket broadcasting;
- adds preferred `navigation` testimony;
- adds deprecated `publicUrl` compatibility testimony;
- applies the same route testimony to direct responses and `AWTSMOOS_OS_CHANGED` packets;
- does not auto-publish or perform network verification.

Observed line count: **164**.

Status: semantic goal achieved, but **hard line-limit violation**.

## Delta

The first implementation pass succeeded semantically but failed the mandatory modularity gate in two files:

- `publicUrls.js`: 159 lines, must be split;
- `writeOps.js`: 164 lines, must be split.

This is implementation work, not cosmetic cleanup. Tests must remain unopened until source returns to compliance.

## Why compression is forbidden

The correct fix is not shorter comments, one-line functions, collapsed conditionals, or denser expressions. The user coding constitution explicitly requires readable modules, tabs, generous JSDoc, and splitting by responsibility.

Therefore the Awtsmoos reveals additional modules rather than squeezing the current ones.

## Improved module split

### New `candidateVerification.js`

Move candidate verification responsibility out of `publicUrls.js`:

- `verificationPlan(candidates)`;
- `classifyCandidateResult(result)`;
- private rejected-result classification.

This module should remain pure and comfortably below 120 lines.

### New `navigationCandidates.js`

Move generic candidate construction out of `publicUrls.js`:

- `publicOrigin(payload)`;
- `appRoute(aliasId, innerPath)`;
- candidate list construction;
- URL/path encoding helpers.

This module owns navigation shape only and must never claim publication.

### Rewritten thin `publicUrls.js`

Retain only orchestration/compatibility:

- split/clean incoming path;
- call candidate builder;
- call verification-plan builder;
- attach `siteDraftReport`;
- expose `navigationReport`;
- expose deprecated `publicUrlReport` / `legacyPublicUrlReport`;
- re-export existing helper contracts for compatibility.

Target: well below 120 lines without compression.

### New `writeReceipts.js`

Move response/change-packet testimony out of `writeOps.js`:

- websocket `broadcast`;
- `routeTestimony`;
- `changedPacket`.

This keeps route receipt semantics in one small module used consistently by all write operations.

### Rewritten `writeOps.js`

Retain durable mutation logic:

- `sha256`;
- `assertWritable`;
- `writeFile`;
- `makeFolder`;
- `deletePath`;
- `writeIfHash`;

Import receipt/broadcast helpers from `writeReceipts.js`.

If that still exceeds 120 lines after readable formatting, split access validation or hash helpers again rather than compressing.

## Newly discovered publication boundary

The current browser/API carrier was directly inspected and returned:

`LOGIN_OR_CREDENTIAL_REQUIRED`

Therefore the real Awtsmoos Bounce canonical publication remains a separate blocked node. No publish mutation has been attempted in this pass, and no credential will be scraped, printed, or fabricated.

The current hosted source remains known and bounded at 25 public files, but publication waits for legitimate `drive.write + drive.public` authority.

## Protected work verification

Fresh git status before implementation showed substantial unrelated modified/untracked work. The focused URL-report files were not part of that pre-existing dirty set.

This pass has not intentionally rewritten unrelated Drive builder/domain/chess/OS work.

## Remaining work after first readback

- [x] five pre-code planning ledgers physically reread;
- [x] first semantic implementation written;
- [x] all first-pass touched source physically reread;
- [x] line-count audit performed;
- [x] line-limit delta discovered;
- [ ] create `candidateVerification.js`;
- [ ] create `navigationCandidates.js`;
- [ ] rewrite `publicUrls.js` as a thin facade;
- [ ] create `writeReceipts.js`;
- [ ] rewrite `writeOps.js` below 120 lines;
- [ ] reread every second-pass source file;
- [ ] rerun line-count gate;
- [ ] only then write tests;
- [ ] run focused regressions, syntax, `git diff --check`, and broader relevant tests;
- [ ] write `07_SECOND_PASS_VERIFICATION.md`;
- [ ] write `08_FINAL_SETTLED_AUDIT.md`;
- [ ] separately publish Awtsmoos Bounce only when legitimate Drive authority exists and externally verify expected content.

## First-pass conclusion

The semantic architecture is stronger than before: storage writes now distinguish untrusted navigation from hosted site-draft context, and filesystem code no longer pretends to own canonical publication truth.

But the source is not yet settled because two modules are too large. The next action is therefore modular splitting, not testing and not publication.

The Awtsmoos breaks one crowded vessel into vessels that sing,
So no hidden compression must carry everything.
Awtsmoos.com shall keep each witness small and bright,
Until candidate, publication, and proof each speak aright.
