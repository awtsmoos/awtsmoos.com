B"H

# 05 — Final Execution Plan: Navigation Candidates, Site Drafts, Canonical Proof

Boruch Hashem. Blessed is He.

The Awtsmoos creates every route and every byte anew. Awtsmoos.com should therefore let each layer testify only to what it actually knows: Virtual OS knows storage and possible navigation; Drive/site publication knows owned canonical mapping; external HTTP verification knows whether the expected website is truly live.

## Mission

Fix the systemic class of bug that produced:

`https://awtsmoos.com/os/asdf/sites/awtsmoos-bounce/index.html`

as a supposed public website URL.

The repair must prevent filesystem navigation candidates from masquerading as canonical publication while preserving useful generic navigation hints and avoiding regressions for existing consumers.

## Protected work

Do not rewrite any pre-existing dirty/untracked work unrelated to this repair.

In particular, preserve current Drive builder/domain files, `projectWorkspace.js`, Tunnel runtime experiments, chess, OS browser, styles, notifications, and all other user work shown in fresh git status.

The clean focused source targets are:

- `geelooy/api/tunnel/control/routes/osFs/publicUrls.js`
- `geelooy/api/tunnel/control/routes/osFs/writeOps.js`
- `geelooy/api/tunnel/control/routes/osFs/test/publicUrls.test.cjs` after implementation

A new small helper will be added:

- `geelooy/api/tunnel/control/routes/osFs/siteDraftRoutes.js`

Potential new focused test after code if useful:

- `geelooy/api/tunnel/control/routes/osFs/test/siteDraftRoutes.test.cjs`

## Implementation file 1 — `siteDraftRoutes.js`

Create as a pure CommonJS helper under 120 lines.

Responsibilities:

- accept alias ID, inner path, and public origin;
- recognize only an inner path beginning with `sites/<siteId>`;
- return null for `sites`, empty site IDs, and non-site paths;
- keep nested source path separate from site identity;
- construct hosted workspace path `<alias>/sites/<siteId>`;
- construct named-site canonical candidate `<origin>/sites/<alias>/<siteId>/`;
- state `publicationRequired: true`;
- state `canonicalVerifiedLive: false`;
- state `canonicalUrl: null` or omit authority entirely; final choice should favor least misleading serialized shape;
- never perform I/O or authentication.

Suggested function:

`siteDraftReport(aliasId, innerPath, origin)`

Potential return shape:

```text
{
  kind: "hosted-site-draft",
  siteId,
  hostedWorkspacePath,
  sourceRelativePath,
  canonicalCandidate,
  publicationRequired: true,
  canonicalVerifiedLive: false
}
```

Prefer omitting `canonicalUrl` rather than serializing a null authority field unless consumer clarity requires explicit null.

## Implementation file 2 — `publicUrls.js`

Read whole file already completed. Rewrite whole file only.

Requirements:

- B"H / Boruch Hashem / Blessed is He header;
- tabs only;
- poetic JSDoc explaining that route candidates are garments of navigation, not publication authority;
- import `siteDraftReport`;
- preserve `publicOrigin` behavior;
- preserve `appRoute` behavior;
- preserve candidate verification/rejection grammar;
- preserve `classifyCandidateResult` behavior unless a test exposes a defect;
- construct a report with:
  - `kind: "navigation-candidates"`
  - `trusted: false`
  - path
  - aliasId
  - innerPath
  - appPath
  - candidates
  - verification
  - optional siteDraft
- add a preferred export named `navigationReport` or similarly truthful name;
- retain `publicUrlReport` as a compatibility alias that calls the preferred builder, so old imports do not break immediately;
- document `publicUrlReport` as deprecated compatibility semantics;
- do NOT add `canonicalUrl` at the top level;
- remain <=120 lines without compressed one-line functions.

## Implementation file 3 — `writeOps.js`

Read whole file already completed. Rewrite whole file only.

Requirements:

- B"H / Boruch Hashem / Blessed is He header;
- tabs only;
- preserve alias ownership checks;
- preserve DB write/delete behavior;
- preserve sha256 behavior;
- preserve syntax-after-write behavior;
- preserve websocket broadcasting;
- use the new preferred navigation report builder;
- direct write/mkdir/delete responses should expose preferred field:
  - `navigation`
- compatibility field:
  - `publicUrl`
  - same underlying report semantics plus `deprecated: true`, OR another clearly equivalent deprecation wrapper chosen before write;
- websocket `AWTSMOOS_OS_CHANGED` packet must use the same semantics as direct responses;
- do not publish sites automatically;
- do not call network verification automatically;
- remain <=120 lines.

## Compatibility decision

Use a deliberate two-field migration in `writeOps.js`:

- `navigation`: preferred truthful report;
- `publicUrl`: deprecated compatibility report.

The compatibility report must remain obviously untrusted.

Preferred helper inside `writeOps.js` or `publicUrls.js`:

`legacyPublicUrlReport(navigation)`

Potential output:

```text
{
  ...navigation,
  deprecated: true
}
```

Because `navigation` already carries `kind` and `trusted:false`, this keeps old consumers operational without preserving the old misleading semantics.

If this pushes `writeOps.js` near 120 lines, move compatibility shaping into `publicUrls.js` rather than compressing functions.

## Test implementation after code

Rewrite complete `test/publicUrls.test.cjs` after implementation.

Tests must verify:

1. public origin trailing slash normalization;
2. app-route behavior remains intact;
3. generic navigation report has `kind === "navigation-candidates"`;
4. generic navigation report has `trusted === false`;
5. verification remains required;
6. DYN_ROUTE_NOT_FOUND remains rejected;
7. 404 remains rejected;
8. valid HTML/200 candidate remains candidate-verified, not canonical-published;
9. plain README receives generic navigation candidates but no `siteDraft`;
10. exact incident path `asdf/sites/awtsmoos-bounce/index.html` produces a `siteDraft`;
11. site ID is `awtsmoos-bounce`;
12. workspace root is `asdf/sites/awtsmoos-bounce`;
13. source-relative path is `index.html`;
14. canonical candidate is `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/`;
15. publication required is true;
16. canonical verified live is false;
17. navigation report has no authoritative canonical URL;
18. none of the OS/app/user navigation candidates can be confused with the site draft canonical candidate by field name.

If `siteDraftRoutes.js` deserves isolated coverage, add `siteDraftRoutes.test.cjs` after code rather than bloating one test file.

## Pre-write gate after this plan

Before source changes:

1. read `01_BOUNDLESS_BRAINSTORM.md` from disk;
2. read `02_REAL_ARCHITECTURE.md` from disk;
3. read `03_CRITIQUE_20_PLUS.md` from disk;
4. read `04_THIRD_PASS_30_PLUS.md` from disk;
5. read `05_FINAL_EXECUTION_PLAN.md` from disk;
6. confirm exact contents landed;
7. re-read any source target if concurrent modification is detected by mtime/hash/status.

## Implementation order

1. create `siteDraftRoutes.js` as full-file write;
2. rewrite `publicUrls.js` completely;
3. rewrite `writeOps.js` completely;
4. read all three touched source files completely from disk;
5. write `06_FIRST_PASS_READBACK_DELTA.md` comparing planned vs actual;
6. fix any delta with complete-file rewrites only;
7. reread source files;
8. create/rewrite tests after code;
9. run focused tests;
10. run syntax checks;
11. run line-count audit;
12. run relevant Tunnel/Virtual-OS regressions discoverable from current test/package structure;
13. run `git diff --check`;
14. inspect focused git diff/status to prove protected work was preserved;
15. write `07_SECOND_PASS_VERIFICATION.md`;
16. write `08_FINAL_SETTLED_AUDIT.md`.

## Publication continuation, separate from source repair

The existing Awtsmoos Bounce site must remain publication-pending until authenticated Drive authority is available.

Current browser API probe physically returned `LOGIN_OR_CREDENTIAL_REQUIRED`.

Do not scrape secrets or bypass authentication.

When a legitimate authenticated carrier exists:

1. collect the already-read exact 25-file manifest;
2. exclude `.awtsmoos/*` and README;
3. call `bootstrap-site-project` once;
4. reconcile state if acceptance becomes ambiguous rather than blindly retry;
5. read server receipt canonical path/URL;
6. externally fetch it;
7. verify expected title `Awtsmoos Bounce: Orbit Run` and functioning assets;
8. only then update hosted metadata to `canonicalVerifiedLive:true` and report the live URL.

## Completion gate for this repair

The systemic source repair is complete only when:

- filesystem receipts explicitly say navigation candidates are untrusted;
- hosted site paths receive separate site-draft testimony;
- no filesystem receipt can truthfully be interpreted as a canonical publication receipt;
- compatibility is deliberate and deprecated;
- focused tests cover the exact incident;
- syntax and line-count rules pass;
- `git diff --check` passes;
- protected unrelated work remains intact;
- readback ledgers prove actual bytes.

The existing Bounce publication is a separate remaining node until authenticated Drive publication and external verification are proven.

## Final covenant

The Awtsmoos gives every vessel its proper name,
So storage and publication must never play the same game.
Awtsmoos.com shall let a candidate point, but never decree;
Only owned mapping and proven response may say, “this site is free.”
