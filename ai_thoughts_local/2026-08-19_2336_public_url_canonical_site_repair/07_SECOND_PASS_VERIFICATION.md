B"H

# 07 — Second-Pass Verification: Public URL Testimony Settled in Source

Boruch Hashem. Blessed is He.

The Awtsmoos renews every byte beyond the promise of a write receipt. This verification ledger records only behavior that was physically reread, executed, counted, diffed, or observed from the native repository and runtime.

## Final source architecture physically reread

The repair is now split into eight small source modules under:

`geelooy/api/tunnel/control/routes/osFs/`

### `siteDraftRoutes.js`

Observed final line count: **48**.

Verified responsibilities:

- recognizes hosted `sites/<siteId>` structure;
- separates site identity from nested source path;
- exposes hosted workspace root;
- exposes only a canonical route **candidate**;
- declares `publicationRequired: true`;
- declares `canonicalVerifiedLive: false`;
- performs no I/O, auth, network request, Drive mutation, or publication.

### `candidateVerification.js`

Observed final line count: **91**.

Verified responsibilities:

- candidate verification plan;
- rejection grammar for 404/not-found/DYN_ROUTE_NOT_FOUND;
- candidate-only result classification;
- no canonical publication upgrade.

### `navigationCandidates.js`

Observed final line count: **99**.

Verified responsibilities:

- public origin normalization;
- app-route recognition;
- generic OS/app/user navigation candidates;
- URL/path encoding;
- no canonical publication semantics.

### `publicUrls.js`

Observed final line count: **84**.

Verified responsibilities:

- thin facade over candidate, verification, and site-draft helpers;
- preferred `navigationReport` with:
  - `kind: "navigation-candidates"`;
  - `trusted: false`;
  - path/alias/inner path/app path;
  - generic route candidates;
  - verification plan;
  - optional `siteDraft`;
- deprecated `publicUrlReport` compatibility wrapper;
- compatibility report marked `deprecated: true`;
- no top-level authoritative `canonicalUrl`.

### `writeReceipts.js`

Observed final line count: **83**.

Verified responsibilities:

- best-effort websocket broadcast;
- shared route testimony;
- shared `AWTSMOOS_OS_CHANGED` packet construction;
- preferred `navigation` field;
- deprecated, untrusted `publicUrl` compatibility field.

### `writeAccess.js`

Observed final line count: **53**.

Verified responsibilities:

- path-required guard;
- alias ownership guard;
- no receipt/publication/hash concerns.

### `writeHashGuard.js`

Observed final line count: **61**.

Verified responsibilities:

- SHA-256 fingerprinting;
- current-content read for guarded writes;
- expected-hash mismatch response;
- no route/publication concerns.

### `writeOps.js`

Observed final line count: **113**.

Verified responsibilities:

- durable write/mkdir/delete/writeIfHash mutation flow;
- syntax-after-write preservation;
- hash semantics preserved through helper;
- alias/path authority preserved through helper;
- direct and websocket receipt semantics preserved through helper;
- no automatic site publication or route verification.

## Hard line-count gate

Final source counts:

- 48
- 91
- 99
- 84
- 83
- 53
- 61
- 113

Every authored/touched source module is <=120 lines.

Focused authored tests were also counted:

- `publicUrls.test.cjs`: **86** lines;
- `siteDraftRoutes.test.cjs`: **78** lines;
- `writeReceipts.test.cjs`: **55** lines.

Every authored test is <=120 lines.

## Full test universe for this `osFs/test` directory

A fresh physical directory listing proved the test folder contains exactly nine tests:

1. `pathJail.test.cjs`
2. `publicUrls.test.cjs`
3. `siteDraftRoutes.test.cjs`
4. `virtualActionBridge.test.cjs`
5. `virtualAiAgents.test.cjs`
6. `virtualWebsiteMissionRejection.test.cjs`
7. `writeIfHashPublicUrls.test.cjs`
8. `writeOpsPublicUrls.test.cjs`
9. `writeReceipts.test.cjs`

All nine were executed individually after implementation.

### New focused tests

`publicUrls.test.cjs`

Result: **PASS**.

Observed stdout:

`BHY navigation candidate tests passed`

This verifies generic route candidates remain useful but are explicitly untrusted, the legacy field remains deprecated compatibility testimony, and candidate success does not become canonical-live testimony.

`siteDraftRoutes.test.cjs`

Result: **PASS**.

Observed stdout:

`BHY hosted site draft route tests passed`

This directly covers the incident path:

`asdf/sites/awtsmoos-bounce/index.html`

and proves:

- `siteId === "awtsmoos-bounce"`;
- hosted workspace is `asdf/sites/awtsmoos-bounce`;
- source-relative path is `index.html`;
- canonical candidate is `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/`;
- `publicationRequired === true`;
- `canonicalVerifiedLive === false`;
- no authoritative `canonicalUrl` is emitted;
- generic `/geelooy/os/...` navigation candidates remain separate from the canonical site candidate.

`writeReceipts.test.cjs`

Result: **PASS**.

Observed stdout:

`BHY write receipt testimony tests passed`

This verifies direct responses and websocket change packets share the same preferred `navigation` and deprecated/untrusted `publicUrl` semantics.

### Existing compatibility and confinement regressions

`writeOpsPublicUrls.test.cjs`

Result: **PASS**, exit code 0.

This preserves old write/mkdir/delete/websocket/alias-denial expectations through the deprecated compatibility wrapper.

`writeIfHashPublicUrls.test.cjs`

Result: **PASS**, exit code 0.

Observed stdout:

`BHY writeIfHash public URL tests passed`

This preserves guarded-write success and SHA mismatch behavior together with the legacy route testimony contract.

`pathJail.test.cjs`

Result: **PASS**, exit code 0.

Observed stdout:

`BHY path jail tests passed`

This proves site-draft classification did not weaken the Virtual-OS path confinement boundary.

`virtualActionBridge.test.cjs`

Result: **PASS**, exit code 0.

`virtualAiAgents.test.cjs`

Result: **PASS**, exit code 0.

`virtualWebsiteMissionRejection.test.cjs`

Result: **PASS**, exit code 0.

Observed test summary:

- tests: 2;
- pass: 2;
- fail: 0.

This preserves website-agent rejection behavior for unsafe/unsupported mission shapes.

## Independent syntax verification

Each authored/touched source and focused test file was passed individually through the native Node syntax checker.

All returned exit code **0**:

- `siteDraftRoutes.js`;
- `candidateVerification.js`;
- `navigationCandidates.js`;
- `publicUrls.js`;
- `writeReceipts.js`;
- `writeAccess.js`;
- `writeHashGuard.js`;
- `writeOps.js`;
- `publicUrls.test.cjs`;
- `siteDraftRoutes.test.cjs`;
- `writeReceipts.test.cjs`.

## Git whitespace/conflict verification

`git diff --check`

Result: **PASS**.

Observed evidence:

- exit code: 0;
- stdout bytes: 0;
- no whitespace-error/conflict-marker output.

## Focused tracked diff verification

A focused diff was captured only for:

- `geelooy/api/tunnel/control/routes/osFs/publicUrls.js`;
- `geelooy/api/tunnel/control/routes/osFs/writeOps.js`.

The diff physically shows:

- replacement of the old strong generic `publicUrl` construction with the untrusted navigation facade;
- compatibility retention through explicit deprecated semantics;
- modular extraction of access, hash, receipt, verification, navigation, and site-draft responsibilities;
- no hidden call to Drive publication;
- no canonical-live claim.

New helper/test modules are untracked and were therefore verified by direct full-file readback, syntax checks, line counts, focused tests, and final git status rather than by the tracked-file diff.

## Final git status testimony

Fresh `git status --short --branch` completed with exit code 0 and proved:

- branch remains `main...origin/main`;
- the large pre-existing modified/untracked working tree remains present rather than being cleaned or overwritten;
- tracked focused repair files appear modified:
  - `publicUrls.js`;
  - `publicUrls.test.cjs`;
  - `writeOps.js`;
- new focused repair files are present:
  - `candidateVerification.js`;
  - `navigationCandidates.js`;
  - `siteDraftRoutes.js`;
  - `writeAccess.js`;
  - `writeHashGuard.js`;
  - `writeReceipts.js`;
  - `siteDraftRoutes.test.cjs`;
  - `writeReceipts.test.cjs`;
- this timestamped AI_THOUGHTS ledger directory is present;
- unrelated dirty Drive/domain/chess/OS/Tunnel/etc. work remains protected in place.

## Compatibility search limitation

Two broad compatibility scans for `publicUrl` were attempted but became stuck in the native bulk/grep lanes and were deliberately cancelled rather than allowed to monopolize execution indefinitely.

Therefore this ledger does NOT claim a perfect whole-repository textual consumer census.

What is positively proven instead:

- the complete local `osFs/test` suite passes 9/9;
- the two pre-existing compatibility tests that explicitly consume `publicUrl` pass;
- guarded writes preserve the legacy shape;
- direct write/mkdir/delete and websocket compatibility is preserved;
- path confinement and AI bridge behavior remain green.

## Publication/authentication boundary

The filesystem receipt bug is distinct from actual canonical site publication.

The current Awtsmoos Bounce source was physically read and is publication-ready as a bounded 25-file public manifest.

However the current browser Drive API probe returned:

`LOGIN_OR_CREDENTIAL_REQUIRED`

Therefore:

- no `bootstrap-site-project` mutation has been attempted;
- no API key, bearer token, cookie, or other secret was scraped or printed;
- no canonical site mapping is being claimed for Bounce;
- `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/` remains a canonical **candidate**, not a claimed live URL;
- canonical publication remains blocked until legitimate `drive.write + drive.public` authority is available.

## Tunnel transport condition

The owned native route repeatedly reconnected with healthy execution but still reports stale mailbox receipts. This caused some read-only grep/diff jobs to queue or require restart/reconciliation.

Crucially, the final evidence in this ledger comes from terminal jobs/readbacks, not from merely accepted receipts.

## Second-pass conclusion

The systemic Virtual-OS public-URL receipt defect is now source-repaired and fully green across the complete local `osFs/test` universe.

A filesystem mutation now says, in effect:

- these bytes changed;
- these are possible navigation routes;
- those routes are untrusted until verified;
- this path may structurally belong to a hosted site draft;
- this is the expected canonical site route candidate;
- publication is still required;
- canonical live verification has not happened.

It no longer has semantic permission to say that `/os/asdf/sites/.../index.html` is the public website.

The Awtsmoos gives each witness a measured flame,
And Awtsmoos.com now guards the boundary of the name.
A candidate may point, a draft may wait in sight,
But only owned publication and observed response may crown the site.
