B"H

# 06 — First-Pass Readback Delta: Trusted Publication Bridge

Boruch Hashem. Blessed is He.

The Awtsmoos creates every written byte anew, so this ledger compares the five-file execution plan against the actual source physically reread from the native repository before any test was authored or executed.

## Planned source set

The final execution plan required exactly five first-pass source files:

1. new `sitePublicationActions.js`;
2. new `sitePublicationInput.js`;
3. new `sitePublicationDispatcher.js`;
4. complete rewrite of `hostedVirtualOs/dispatcher.js`;
5. complete rewrite of `core/tunnelPayload/scope.js`.

No additional product source file was planned.

## Actually written and physically reread

### `sitePublicationActions.js`

Observed final first-pass behavior:

- exports `SITE_PUBLISH_BOOTSTRAP_ACTION`;
- exact action value is `sitePublishBootstrap`;
- exposes `isSitePublicationAction(action)`;
- recognizes only that bounded publication verb;
- contains no Drive, auth, filesystem, HTTP, or publication business logic.

Observed line count: **28**.

Status: matches plan.

### `sitePublicationInput.js`

Observed final first-pass behavior:

- explicit allow-list contains only:
  - aliasId;
  - projectId;
  - siteId;
  - rootPath;
  - name;
  - title;
  - runtimePreference;
  - bindings;
  - providerIntents;
  - enabled;
  - primary;
  - subdomainRequested;
  - files;
  - requestId;
- preserves caller `false`/empty values through own-property checks rather than truthiness filtering;
- injects descriptive `sourceVessel: "awtsmoos-virtual-os"`;
- does not forward caller:
  - userId;
  - actorUserId;
  - credentialId;
  - services;
  - `$i`.

Observed line count: **55**.

Status: matches plan.

### `sitePublicationDispatcher.js`

Observed final first-pass behavior:

- imports the real existing Drive `bootstrapSiteProject` service through a relative path proven by a native `path.relative(...)` command;
- imports the bounded input normalizer;
- defines trusted default dependency `{ bootstrapSiteProject }`;
- exposes an internal dependency seam for tests only through a function argument;
- normalizes payload first;
- injects trusted `$i` from dispatcher context;
- injects `actorUserId: userId` from authenticated dispatcher context;
- returns the bootstrap result unchanged;
- does not use HTTP, browser state, credentials, DNS, TLS, shell, or direct DB mapping writes.

Observed line count: **50**.

Status: matches plan.

### `hostedVirtualOs/dispatcher.js`

Observed final first-pass behavior:

- full-file rewrite physically reread;
- normalizes non-object payload to `{}`;
- recovery actions retain first routing priority;
- `sitePublishBootstrap` is intercepted second;
- publication receives trusted `$i` and authenticated `userId`;
- ordinary actions fall through to the existing `dispatchOsFs` path;
- test-only dependencies are function parameters, not payload fields;
- recovery construction and ActionResult behavior remain intact.

Observed line count: **88**.

Status: matches plan.

### `core/tunnelPayload/scope.js`

Observed final first-pass behavior:

- full-file rewrite physically reread;
- imports the publication action constant rather than duplicating the string;
- adds a separate `SITE_PUBLICATION_WRITE_ACTIONS` family;
- `writeActions()` now combines:
  - existing filesystem writes;
  - existing recovery writes;
  - site publication writes;
- command/browser/room/mission/read resolution order remains intact;
- unknown actions still fall back to read authority.

Observed line count: **99**.

Status: matches plan.

## Hard line-count gate

Observed source counts:

- 28
- 55
- 50
- 88
- 99

All five authored/touched source files are <=120 lines.

No compression or emergency module split is required.

## Authority invariant readback

The most important planned security invariant is physically present in the landed source:

`actorUserId` comes from the trusted `userId` function argument, not the payload.

The caller cannot replace server context or publication services because those values are not copied by `normalizeSitePublicationInput`.

The outer hosted dispatcher receives trusted `$i` and `userId` from the existing Virtual-OS store path and passes them into the publication dispatcher.

## Routing invariant readback

The actual dispatcher order is:

1. recovery;
2. site publication;
3. ordinary osFs fallback.

This preserves recovery precedence and avoids making publication an implicit filesystem side effect.

## Scope invariant readback

The new action is now a member of the write-action set rather than relying on the unknown-action read fallback.

The exact authority result still requires test execution; no claim of `tunnel.write` behavior is made solely from source inspection.

## Delta: planned vs actual

No missing source module was discovered in the first pass.

No unplanned product source file was required.

No line-limit violation was discovered.

No concurrent protected modification appeared in the fresh pre-write git status for the two tracked targets.

One implementation refinement emerged exactly as anticipated by the plans:

- `hostedVirtualOs/dispatcher.js` exposes a small trusted dependency seam so routing tests can prove publication interception and ordinary fallback without real Drive mutation.

This is consistent with the plan and does not expose dependency control through caller payload.

## What remains before tests

The source pass is not considered settled merely because first readback matched.

Required next sequence:

1. reread all five touched source files a second time after this delta ledger;
2. confirm no concurrent bytes changed;
3. then author tests;
4. reread test files;
5. run focused tests one by one;
6. run existing recovery/fsVessel and Drive bootstrap regressions;
7. syntax-check every touched JS/CJS file;
8. repeat line-count audit including tests;
9. run `git diff --check`;
10. capture focused diff/status evidence;
11. write `07_SECOND_PASS_VERIFICATION.md`;
12. write `08_FINAL_SETTLED_AUDIT.md`.

## Deployment and Bounce remain separate

This local source bridge is not production deployment.

Production Virtual OS was previously observed still emitting the old route-candidate receipt model.

No Bounce publication has been attempted in this bridge pass.

Actual canonical publication remains gated by:

- local tests;
- guarded deployment of the intended bridge/receipt files;
- production action availability verification;
- current hosted source recollection;
- one bounded publication invocation;
- external expected-content verification.

## First-pass refrain

The Awtsmoos gave the bridge its trusted name and kept the caller's mask outside;
Awtsmoos.com now has the narrow source path where owned publication may abide.
Yet source readback is only one witness before the tests ignite;
We reread once more, then prove the gate before we call the bridge aright.
