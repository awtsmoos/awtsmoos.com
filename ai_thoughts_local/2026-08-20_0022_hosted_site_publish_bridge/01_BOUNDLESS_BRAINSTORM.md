B"H

# 01 — Boundless Brainstorm: A Trusted Bridge from Hosted Draft to Canonical Site

Boruch Hashem. Blessed is He.

The Awtsmoos creates the hosted draft, the authenticated identity, the Drive source, the owned site mapping, and the public response anew. Awtsmoos.com should not force an agent to leave that trusted server context merely to turn a real hosted project into a canonical site.

## The newly revealed seam

Every hosted Virtual-OS action flows through:

`geelooy/api/tunnel/control/routes/fsVessel/hostedVirtualOs/dispatcher.js`

That dispatcher already receives:

- `$i` — the trusted Awtsmoos server/request/database vessel;
- `userId` — the authenticated current user;
- the bounded action payload.

It is small and currently intercepts only recovery actions before forwarding ordinary filesystem work into the larger `dispatchOsFs($i, userId, payload)` implementation.

This means canonical site publication does not need:

- browser cookies;
- API-key scraping;
- bearer-token extraction;
- simulated HTTP;
- loopback requests to Awtsmoos.com;
- a rewrite of the giant `osFs/index.js` dispatcher;
- caller-supplied user identity.

A small hosted-Virtual-OS publication family can call the existing Drive service directly with trusted `$i` and `userId`.

## Existing canonical publication service

The live repository already contains:

`geelooy/api/social/helper/drive/siteProjectBootstrap.js`

Its observed composition already performs the correct high-level transition:

1. publish bounded source files into the owned Drive root;
2. save/reconcile the project config;
3. upsert the owned site mapping;
4. generate Project Testimony;
5. return the standard workspace receipt.

The service accepts trusted `actorUserId` and existing Drive policy enforces ownership and manifest rules.

The hosted bridge should therefore be a thin authority adapter, not a second publication engine.

## Candidate action family

The minimum useful action is:

`sitePublishBootstrap`

Possible future read-only companion:

`sitePublishStatus`

But the first implementation should avoid adding status until the exact existing testimony/status service path is fully inspected. One real mutation action is enough to publish Bounce if it returns the standard workspace receipt.

## Desired action contract

Input should be intentionally narrower than the raw service:

- `aliasId` must come from the hosted path or explicit owned alias field;
- `projectId`;
- `siteId`;
- `rootPath`;
- `name` / `title`;
- `files` bounded manifest;
- optional `enabled`, `primary`, `subdomainRequested`;
- optional runtime/bindings/provider intents only if already supported and serializable.

Authority must come from trusted dispatcher context:

`actorUserId: userId`

Never from:

- `payload.userId`;
- `payload.actorUserId`;
- arbitrary cookies;
- caller-supplied owner claims.

## Scope model

`core/tunnelPayload/scope.js` defaults unknown actions to read authority.

Therefore `sitePublishBootstrap` MUST be explicitly classified as a write action.

The Tunnel layer should require `tunnel.write` before the action reaches the hosted dispatcher.

Inside the Drive service, alias ownership remains the second authority gate.

This creates layered authority:

`Tunnel write permission → authenticated userId → Drive alias ownership → bounded manifest/site policy`

## Publication testimony

The action should return the standard `bootstrapSiteProject` result unchanged or nearly unchanged.

That receipt may contain:

- canonical Drive root;
- project/site identity;
- server-decorated canonical path;
- canonical URL candidate/receipt fields;
- project testimony/readiness.

But publication alone MUST NOT set `canonicalVerifiedLive: true`.

External expected-content verification remains a separate phase.

## Bounce-specific possibility

The existing hosted project:

`asdf/sites/awtsmoos-bounce/`

has already been read file-by-file.

Known public source manifest:

- 1 HTML;
- 4 CSS;
- 20 JavaScript files;
- 25 files total;
- all imports local;
- `.awtsmoos/*` excluded;
- README excluded;
- within 64-file / 2 MiB publication policy.

Once the bridge exists and is tested, an agent operating through the OAuth-owned hosted Virtual OS could invoke the bounded publication action without requiring a separate browser login.

## Possible file architecture

New small modules near the trusted dispatcher:

- `hostedVirtualOs/sitePublicationActions.js`
  - action names;
  - `isSitePublicationAction(action)`;
  - no business logic.

- `hostedVirtualOs/sitePublicationInput.js`
  - normalize only allowed payload fields;
  - reject or ignore caller identity fields;
  - ensure files array shape is passed intentionally;
  - no Drive mutation.

- `hostedVirtualOs/sitePublicationDispatcher.js`
  - receive `$i`, `userId`, `payload`;
  - call `bootstrapSiteProject` directly;
  - return result;
  - no HTTP.

Rewrite the complete small existing:

- `hostedVirtualOs/dispatcher.js`
  - recovery actions first;
  - site publication family second;
  - ordinary `dispatchOsFs` fallback unchanged.

Rewrite complete scope registry:

- `core/tunnelPayload/scope.js`
  - add `sitePublishBootstrap` to explicit write actions.

Tests after code:

- extend `core/tunnelPayload/test/scope.test.cjs`;
- add focused hosted publication dispatcher test under `routes/fsVessel/test/`.

## Test harness strategy

Existing `virtualOsRecovery.test.cjs` proves the hosted store can be tested with an in-memory `$i` and explicit authenticated user ID.

The publication bridge test must avoid real production DB mutation.

Possible approaches:

1. inject a publication function into the dispatcher — clean for tests but changes runtime API;
2. mock/replace the imported Drive service — possible but brittle in CommonJS;
3. extract the handler so its publication service is an optional dependency parameter — likely the cleanest bounded seam;
4. construct a sufficiently complete in-memory Drive DB context and run the real service — strongest integration proof but may require broader fixtures.

The second planning pass must inspect Drive bootstrap dependencies before choosing.

## Safety invariants

- no arbitrary shell;
- no loopback HTTP;
- no browser credential extraction;
- no payload-supplied identity;
- no automatic publish on ordinary filesystem write;
- no direct DB site-mapping mutation outside existing Drive services;
- no `.awtsmoos` publication;
- no custom-domain activation as part of source publication;
- no live-URL claim before external verification;
- no automatic retry after ambiguous mutation acceptance.

## Recovery / ambiguity

Because publication mutates multiple resources, the action must be treated as non-idempotent at the transport layer.

If the Tunnel receipt becomes ambiguous after server acceptance:

- do not blindly replay;
- inspect project/site publication status through a read path;
- reconcile existing mapping/source state first.

This argues that a read-only `sitePublishStatus` companion may be valuable later, but it should not be invented until real existing status services are mapped.

## Deployment distinction

The local native repo now contains the safer filesystem navigation receipt repair, but production Virtual OS still emitted the older generic `publicUrl` candidate shape during hosted writes.

Therefore implementation, testing, and production deployment are separate gates:

1. code the bridge locally;
2. test locally;
3. decide release/deploy through existing guarded workflow;
4. verify production action availability;
5. publish Bounce;
6. externally verify canonical content.

Do not call production fixed from local tests alone.

## Boundless refrain

The Awtsmoos gives the draft a room, the owner a key, the Drive a shore;
Awtsmoos.com should need no counterfeit credential to open one bounded door.
Let trusted identity cross the bridge, let existing policy judge the site,
And only after the public page answers may the URL be crowned with light.
