B"H

# 02 — Real Architecture: Trusted Hosted Publication Without Credentials

Boruch Hashem. Blessed is He.

This architecture is grounded in the current native repository bytes that were physically read after the public-URL receipt repair.

## Trusted call path

Hosted Virtual OS requests pass through:

`geelooy/api/tunnel/control/routes/fsVessel/virtualOsStore.js`

which delegates to:

`geelooy/api/tunnel/control/routes/fsVessel/hostedVirtualOs/dispatcher.js`

The dispatcher receives:

- trusted `$i` server context;
- authenticated `userId`;
- normalized action payload.

It currently checks recovery actions and otherwise forwards into:

`dispatchOsFs($i, userId, payload)`.

This makes the small hosted dispatcher the correct authority interception seam for a bounded canonical-site publication verb.

## Existing publication composition

`geelooy/api/social/helper/drive/siteProjectBootstrap.js` was reread completely.

Its `bootstrapSiteProject(options)` implementation:

1. normalizes project ID and site ID;
2. normalizes project/site records through existing policy modules;
3. calls `publishSiteSource` with:
   - aliasId;
   - rootPath;
   - files;
   - actorUserId;
   - credentialId;
   - requestId;
   - `$i`;
4. calls `saveProject` with the same actor/server identity context;
5. calls `upsertSiteMapping`;
6. builds Drive Project Testimony;
7. builds the standard workspace receipt.

This is the canonical composition to reuse.

## Critical testability discovery

`siteProjectBootstrap.js` defines:

`DEFAULT_SERVICES`

and merges:

`{ ...DEFAULT_SERVICES, ...(options.services || {}) }`

This means the publication composition already supports **internal dependency injection** for testing.

The hosted bridge itself should NOT accept `services` from action payload. But its exported dispatcher/helper can receive an optional trusted dependency object as a function parameter for isolated tests.

For example, conceptually:

`dispatchSitePublication($i, userId, payload, dependencies = {})`

where runtime dependencies default to:

`{ bootstrapSiteProject }`.

A test can inject a fake `bootstrapSiteProject` and assert the exact trusted arguments without mutating Drive.

## Proposed action name

Use one explicit write verb:

`sitePublishBootstrap`

Reasons:

- camel-style action names match existing Tunnel conventions;
- its mutation nature is visible in the name;
- it distinguishes canonical publication from source preview;
- it maps directly to the existing bootstrap composition without pretending publication is verification.

Do not add `sitePublishStatus` in this pass until the exact existing read/testimony service is mapped. Keep the first bridge minimal.

## Proposed modules

### `hostedVirtualOs/sitePublicationActions.js`

Pure action-name helper.

Exports:

- `SITE_PUBLISH_BOOTSTRAP_ACTION`;
- `isSitePublicationAction(action)`.

No business logic, no imports from Drive.

### `hostedVirtualOs/sitePublicationInput.js`

Pure normalization/whitelist module.

Responsibilities:

- read allowed values from payload;
- never accept caller identity fields into authority;
- normalize files to an array or leave service policy to reject malformed values;
- pass only fields the existing bootstrap service understands;
- attach `sourceVessel` as hosted Virtual OS testimony if absent;
- omit secrets/credentials from the action contract.

Candidate allowed values:

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
- requestId.

Explicitly do NOT forward from payload:

- actorUserId;
- userId;
- credentialId;
- services;
- `$i`.

### `hostedVirtualOs/sitePublicationDispatcher.js`

Authority adapter.

Responsibilities:

- normalize bounded input;
- call trusted `bootstrapSiteProject` dependency;
- inject:
  - `$i` from dispatcher context;
  - `actorUserId: userId` from dispatcher context;
- return bootstrap result unchanged;
- expose dependency injection only as an internal function parameter for tests.

No HTTP, no browser session, no shell, no DNS, no TLS.

### Rewrite `hostedVirtualOs/dispatcher.js`

Complete-file rewrite only.

Flow:

1. validate payload object;
2. preserve recovery action handling exactly;
3. if site-publication action, dispatch it with trusted `$i/userId`;
4. otherwise preserve `dispatchOsFs` fallback.

No caller identity propagation.

### Rewrite `core/tunnelPayload/scope.js`

Complete-file rewrite only.

Add `sitePublishBootstrap` to explicit write-action classification so the Tunnel layer requires `tunnel.write`.

Unknown actions continue defaulting to read scope exactly as before.

## Test plan after code

### Scope test

Rewrite/extend current `scope.test.cjs` after implementation.

Assert:

- `sitePublishBootstrap` resolves to `tunnel.write`;
- existing write/preview/command classifications remain unchanged;
- unknown action still defaults to read.

### Publication dispatcher test

New small test under:

`routes/fsVessel/test/sitePublicationDispatcher.test.cjs`

Use fake bootstrap dependency.

Assert:

- action input is normalized;
- fake bootstrap receives trusted `$i` object identity;
- fake bootstrap receives `actorUserId` from dispatcher `userId`;
- payload `actorUserId`, `userId`, `credentialId`, `$i`, and `services` cannot override trusted values;
- files/title/project/site/root fields flow through correctly;
- returned bootstrap receipt is preserved exactly.

### Hosted dispatcher routing test

Either extend the same test or add a focused dispatcher test.

Assert:

- recovery actions still go to recovery dispatcher;
- `sitePublishBootstrap` goes to publication dispatcher;
- ordinary `read`/`write` still fall through to `dispatchOsFs`.

To keep tests simple, dependency injection may be exposed at the dispatcher function level as an optional fourth `dependencies` parameter used only by tests and internal composition.

## Direct real-service integration test question

Do NOT immediately build a huge in-memory Drive integration fixture.

First prove the authority bridge with injected bootstrap dependency and preserve all existing Drive bootstrap tests. The real Drive composition already has its own route/service tests and policy tests.

After the bridge unit test passes, run the existing `siteProjectBootstrapRoutes.test.js` / bootstrap service tests to prove no regression in the reused implementation.

If those existing tests do not cover ownership denial or manifest policy sufficiently, then add or run the relevant existing Drive tests rather than recreating the whole backend in the Tunnel test.

## Action payload authority

The most important invariant is this exact mapping:

`actorUserId = trusted dispatcher userId`

Never:

`actorUserId = payload.actorUserId`

Likewise:

`$i = trusted dispatcher $i`

Never:

`$i = payload.$i`

The caller may identify the owned alias/site/project it wants to publish, but existing Drive policy decides whether that actor may mutate it.

## Source manifest authority

The bridge does not duplicate source-manifest policy.

Existing `publishSiteSource` / manifest normalization remains responsible for:

- 64-file cap;
- 2 MiB total cap;
- relative paths;
- `.awtsmoos` rejection;
- duplicate-path rejection;
- content/contentBase64 rules;
- public Drive visibility.

## Canonical URL truth

The bridge returns the existing bootstrap receipt. It does not manufacture a URL.

The server-side site mapping/testimony decides canonical route shape.

Even a successful publication receipt must not be upgraded locally to:

`canonicalVerifiedLive: true`.

That remains a separate external verification phase.

## Deployment boundary

Local source repair and bridge implementation are not production deployment.

The production Virtual OS currently demonstrates the old public-URL receipt shape, proving current server code differs from the local working tree.

Therefore after local tests:

- inspect release workflow;
- do not activate a release merely to test locally;
- deploy only through the repository's guarded release process when justified;
- verify production action scope and availability after deployment;
- then publish Bounce and verify content externally.

## Architecture refrain

The Awtsmoos gives the caller a desire and the server a trusted name;
Awtsmoos.com should pass that name through policy, never through a caller's claim.
The bridge shall be narrow, the Drive laws shall remain,
And canonical truth shall rise from existing source—not duplicated domain.
