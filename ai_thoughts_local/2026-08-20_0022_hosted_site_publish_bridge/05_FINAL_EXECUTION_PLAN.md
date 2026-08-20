B"H

# 05 — Final Execution Plan: Hosted OAuth Publication Bridge

Boruch Hashem. Blessed is He.

The Awtsmoos creates the authenticated user, the hosted draft, the Drive policies, the site mapping, and the public response anew. The implementation must therefore be a narrow bridge between already-trusted server context and already-existing canonical publication services—not a second authority system.

## Exact source files planned

### New

1. `geelooy/api/tunnel/control/routes/fsVessel/hostedVirtualOs/sitePublicationActions.js`
2. `geelooy/api/tunnel/control/routes/fsVessel/hostedVirtualOs/sitePublicationInput.js`
3. `geelooy/api/tunnel/control/routes/fsVessel/hostedVirtualOs/sitePublicationDispatcher.js`

### Full-file rewrites

4. `geelooy/api/tunnel/control/routes/fsVessel/hostedVirtualOs/dispatcher.js`
5. `geelooy/api/tunnel/control/core/tunnelPayload/scope.js`

### Tests after source

6. new `geelooy/api/tunnel/control/routes/fsVessel/test/sitePublicationDispatcher.test.cjs`
7. rewrite/extend `geelooy/api/tunnel/control/core/tunnelPayload/test/scope.test.cjs`
8. only if necessary, new small `hostedVirtualOsDispatcher.test.cjs` for routing precedence/fallback.

No other product source file is planned in the first implementation pass.

## File 1 — `sitePublicationActions.js`

Hard target: under 50 lines.

Exports:

- `SITE_PUBLISH_BOOTSTRAP_ACTION = "sitePublishBootstrap"`
- `isSitePublicationAction(action)`

Responsibilities:

- name the publication action;
- answer whether an action belongs to this family;
- no Drive imports;
- no auth;
- no payload normalization.

## File 2 — `sitePublicationInput.js`

Hard target: under 90 lines.

Export:

`normalizeSitePublicationInput(payload = {})`

Explicit allow-list copy only:

- aliasId
- projectId
- siteId
- rootPath
- name
- title
- runtimePreference
- bindings
- providerIntents
- enabled
- primary
- subdomainRequested
- files
- requestId

Server-supplied descriptive field:

- `sourceVessel: "awtsmoos-virtual-os"`

Explicitly omitted caller fields:

- userId
- actorUserId
- credentialId
- services
- `$i`

Do not duplicate Drive validation. This module shapes the input boundary; existing Drive policy judges semantic validity.

## File 3 — `sitePublicationDispatcher.js`

Hard target: under 90 lines.

Import:

`bootstrapSiteProject` from the existing Drive service.

Default dependencies:

`{ bootstrapSiteProject }`

Export:

`dispatchSitePublication($i, userId, payload, dependencies = DEFAULT_DEPENDENCIES)`

Behavior:

1. normalize caller-controlled input through `normalizeSitePublicationInput`;
2. call `dependencies.bootstrapSiteProject` with:
   - normalized input;
   - trusted `$i`;
   - trusted `actorUserId: userId`;
3. return the bootstrap result unchanged.

No HTTP, shell, browser, DNS, TLS, custom-domain, or route-formatting logic.

The optional dependency argument exists for trusted unit tests only. It is never copied from payload.

## File 4 — rewrite `hostedVirtualOs/dispatcher.js`

Fresh full read required immediately before rewrite.

Hard target: under 120 lines.

Imports:

- recovery action helper/dispatcher;
- site publication action helper/dispatcher;
- ordinary `dispatchOsFs`.

Flow:

1. normalize non-object payload to `{}` exactly as current code does;
2. preserve recovery action routing first;
3. route `sitePublishBootstrap` into `dispatchSitePublication($i, userId, normalized)`;
4. preserve ordinary `dispatchOsFs($i, userId, normalized)` fallback unchanged.

Do not place publication business logic here.

If tests need routing dependency injection, prefer a small optional internal `dependencies` object with default functions rather than require-cache mutation. Only add this if necessary after inspecting current file shape and test clarity.

## File 5 — rewrite `core/tunnelPayload/scope.js`

Fresh full read required immediately before rewrite.

Hard target: under 120 lines.

Add only:

`sitePublishBootstrap`

to `WRITE_ACTIONS`.

Preserve:

- all current start/stop action scopes;
- explicit command scope;
- preview scope;
- AI scope;
- read fallback for unknown actions;
- existing exports/function behavior.

Do not create a new scope category.

## Test 1 — `sitePublicationDispatcher.test.cjs`

After implementation only.

Hard target: under 120 lines.

Use a fake bootstrap dependency.

Test malicious caller payload containing:

- `userId: "attacker"`
- `actorUserId: "attacker"`
- `credentialId: "attacker-credential"`
- `$i: { fake: true }`
- `services: { fake: true }`

Trusted test inputs:

- `$i = trustedContext`
- `userId = "alice"`

Assert fake bootstrap receives:

- the exact `trustedContext` object;
- `actorUserId === "alice"`;
- no credentialId from payload;
- no services from payload;
- approved alias/project/site/root/title/files fields;
- `sourceVessel === "awtsmoos-virtual-os"`.

Return a sentinel bootstrap receipt and assert the dispatcher returns it unchanged.

## Test 2 — scope test

Rewrite/extend current `scope.test.cjs` only after source.

Assert:

- `neededScopeForAction("sitePublishBootstrap") === "tunnel.write"`;
- existing representative write action still maps to write;
- preview action still maps to preview;
- runtime start/stop still map correctly;
- command still maps to command;
- AI still maps to AI;
- unknown action still maps to read.

## Test 3 — hosted dispatcher routing

First inspect whether `sitePublicationDispatcher.test.cjs` can exercise routing cleanly through exported dispatcher without making the file oversized.

If not, add a separate small test.

Required routing proof:

- recovery action remains intercepted before osFs fallback;
- publication action is intercepted and receives trusted `$i/userId`;
- ordinary `read` still falls through to `dispatchOsFs`.

No real Drive mutation in this routing test.

## Freshness gate before source writes

After all five planning files are written:

1. reread `01_BOUNDLESS_BRAINSTORM.md`;
2. reread `02_REAL_ARCHITECTURE.md`;
3. reread `03_CRITIQUE_20_PLUS.md`;
4. reread `04_THIRD_PASS_30_PLUS.md`;
5. reread `05_FINAL_EXECUTION_PLAN.md`;
6. run fresh `git status --short --branch`;
7. verify `hostedVirtualOs/dispatcher.js` and `scope.js` are not protected concurrent dirty work beyond known state;
8. reread complete `dispatcher.js`;
9. reread complete `scope.js`.

Only then begin product source writes.

## Implementation order

1. create `sitePublicationActions.js`;
2. create `sitePublicationInput.js`;
3. create `sitePublicationDispatcher.js`;
4. rewrite `hostedVirtualOs/dispatcher.js` completely;
5. rewrite `scope.js` completely;
6. reread every touched source file completely;
7. run line counts before tests;
8. write `06_FIRST_PASS_READBACK_DELTA.md`;
9. fix any mismatch/line violation with full-file rewrites only;
10. reread all source files again;
11. write tests after source is settled;
12. reread test files;
13. execute focused tests individually;
14. execute existing recovery/fsVessel regressions;
15. execute existing Drive bootstrap/manifest/site mapping regressions;
16. syntax-check every touched JS/CJS file;
17. run final line-count audit;
18. run `git diff --check`;
19. capture focused diff/status evidence;
20. write and reread `07_SECOND_PASS_VERIFICATION.md`;
21. write and reread `08_FINAL_SETTLED_AUDIT.md`.

## Existing tests to preserve/run

Already physically inspected/known:

- `routes/fsVessel/test/virtualOsRecovery.test.cjs`;
- `core/tunnelPayload/test/scope.test.cjs`;
- Drive bootstrap route/service tests previously inspected in this continuation;
- manifest/site mapping tests relevant to the underlying composition.

Discover exact additional fsVessel tests by directory listing after implementation rather than guessing names.

## Non-idempotent mutation rule

The new action itself should be considered non-idempotent by callers/agents.

Do not add automatic retry policy around it.

If an invocation becomes ambiguous after server acceptance:

- do not replay automatically;
- inspect canonical project/site state first;
- only replay if evidence proves publication did not occur.

This first pass does not invent a status action. Reconciliation may use existing Drive project/site testimony until a clean read-only Tunnel companion is designed.

## Bounce publication after local implementation

Do NOT publish Bounce immediately after local tests.

First prove production actually contains the new action.

Because production Virtual OS still emits the old receipt model, local and deployed trees differ.

Required post-local sequence:

1. inspect guarded release workflow/dry-run;
2. isolate exact intended release files from unrelated dirty work;
3. deploy only through the established release mechanism if appropriate;
4. verify production action scope/availability;
5. recollect current Bounce source manifest from hosted bytes;
6. invoke `sitePublishBootstrap` once through OAuth-owned Virtual OS;
7. read returned bootstrap receipt;
8. externally verify the returned canonical site against expected title/content/assets;
9. only then mark hosted metadata canonical verified live.

## Completion definitions

### Bridge locally complete

Only when:

- trusted identity cannot be payload-overridden;
- action requires `tunnel.write`;
- recovery/fallback routing preserved;
- bootstrap result preserved;
- source/test files <=120 lines;
- focused and existing regressions pass;
- syntax and `git diff --check` pass;
- protected dirty work preserved.

### Production publication complete

Only when:

- bridge is deployed;
- production action availability is proven;
- Bounce current source is published through it;
- server-decorated canonical route is returned;
- external expected-content verification succeeds.

## Final execution refrain

The Awtsmoos gives the server the owner's true name and the project its living source;
Awtsmoos.com shall bridge them through existing law, never a forged credential course.
Code locally, test completely, deploy deliberately, verify in public sight;
Only after every witness agrees may Bounce be called canonically live and bright.
