B"H

# 09 — Post-Audit Auth Bridge Findings

Boruch Hashem. Blessed is He.

The Awtsmoos creates every vessel with its own authority. This addendum records the final hidden-risk investigation performed after the filesystem/public-URL repair had already passed its full local test universe.

## Website-agent output path

`geelooy/api/tunnel/control/core/tunnelPayload/websiteAgents.js` was read completely.

Observed role:

- bounded parser for incoming website/AI-agent control payloads;
- accepts mission/evidence/message/prompt/goal-style metadata;
- does not accept or manufacture `publicUrl`;
- does not accept or manufacture `canonicalUrl`.

`geelooy/api/tunnel/control/core/tunnelPayload/build.js` was read completely.

Observed role:

- generic payload composition;
- merges the bounded website-agent fields into the outgoing control payload;
- performs no URL decoration or canonical-site transformation.

`geelooy/api/tunnel/control/routes/osFs/virtualAiAgents.js` was read completely.

Observed role:

- rejects website mission actions in the hosted Virtual-OS surface;
- ordinary AI task output writes are sent back through the same `dispatch({ action: "write", ... })` path whose receipt semantics were repaired;
- no outgoing public/canonical URL constructor exists in this module.

Conclusion: no second website-agent URL decorator was found that would justify another URL-specific source patch.

## Drive authorization boundary

`geelooy/api/social/helper/drive/authorization.js` was read completely.

Observed accepted actor sources:

1. already-authenticated request `userid`, with alias ownership checked through `verifyAliasOwnership`;
2. explicit scoped Drive credential through the normal credential resolver.

Observed mutation rule:

- owner/session identity may satisfy ownership-scoped Drive mutations;
- explicit credentials remain scope-checked;
- no Tunnel identity is silently substituted into an unauthenticated Drive HTTP request.

The current browser API probe physically returned:

`LOGIN_OR_CREDENTIAL_REQUIRED`

Therefore the current browser is not a legitimate Drive mutation carrier.

## Tunnel authenticated identity investigation

The Virtual-OS AI layer consumes a private `__awtsmoosUserId` payload field for account-scoped AI-key lookup. A tracked-file search did not reveal its injection point, indicating this plumbing belongs to newer/untracked/runtime code rather than a stable tracked contract that should be guessed from Git history.

The outer Virtual-OS dispatcher was read completely:

`geelooy/api/tunnel/control/routes/osFs/index.js`

It physically shows:

- `dispatchOsFs($i, userId, payload)` has both the Awtsmoos request/database vessel `$i` and authenticated `userId`;
- `supportAction(action, payload, next => dispatchOsFs($i, userId, next))` passes only a dispatch closure into generic support actions;
- the generic support layer itself does not receive `$i` or `userId` directly.

This means a future bounded site-publish bridge is architecturally possible at the outer dispatcher layer, but it must be designed intentionally rather than by trusting a payload-supplied user ID.

## Network support is not a publisher

`geelooy/api/tunnel/control/routes/osFs/networkSupport.js` was read completely.

Observed behavior:

- `httpRequest`, `httpJson`, downloads, probes, and cookie actions are hosted support/simulation contracts;
- `httpRequest` explicitly reports `simulated: true`;
- it records HTTP intent without network side effects;
- it does not inherit an Awtsmoos Drive browser/session identity;
- it cannot be used as a hidden canonical publication transport.

Therefore the missing publication authority cannot be bypassed through `httpJson` or a synthetic cookie jar.

## Existing canonical publication caller search

A precise tracked-file search for `bootstrapSiteProject` produced no second tracked adapter beyond the current Drive implementation already inspected in the working tree. No first-class Tunnel alias for canonical site publication was found.

The real canonical publisher remains the Drive composition:

`bootstrap-site-project`

with:

- `drive.write`;
- `drive.public`;
- bounded source publication;
- project reconciliation;
- owned site mapping;
- Project Testimony;
- server-decorated workspace/canonical receipt.

## Why no quick bridge was added

The obvious place to add a Tunnel-authenticated publisher is the outer `dispatchOsFs($i, userId, payload)` layer because that is where authenticated identity and database vessel coexist.

However `routes/osFs/index.js` is already a very large multi-responsibility dispatcher. Under the repository coding constitution, touching it would require a full-file rewrite and radical modular split so no authored source remains above 120 lines.

Adding a single ad-hoc action to that monolith would therefore violate the explicit code law and create a larger architectural regression than the publication issue it tries to solve.

The correct future bridge should instead be part of an intentional dispatcher decomposition, for example:

1. split Virtual-OS action families into small registration modules;
2. introduce a bounded `sitePublicationActions.js` that receives trusted `$i` and `userId` from the dispatcher context, never from caller payload;
3. reuse the existing Drive source/project/site services rather than HTTP-looping back into Awtsmoos.com;
4. enforce owned-alias checks and the same manifest policies as `bootstrap-site-project`;
5. return the same workspace/canonical receipt contract;
6. keep live verification separate from publication;
7. register the action in documented/action-schema surfaces;
8. add authorization, cross-owner denial, source-limit, mapping, replay/ambiguity, and canonical-receipt tests.

That is a real architecture project, not a one-line incident patch.

## Current settled state

### Systemic bad-URL receipt bug

Complete and verified locally:

- untrusted navigation semantics;
- separate site-draft testimony;
- deprecated compatibility wrapper;
- complete local `osFs/test` suite green;
- syntax green;
- line limits green;
- `git diff --check` green.

### Awtsmoos Bounce source

Ready:

- exact 25-file public manifest known;
- all imports local;
- metadata excluded;
- source within publication bounds.

### Canonical Bounce publication

Still not authorized in the current carrier:

- browser Drive API says `LOGIN_OR_CREDENTIAL_REQUIRED`;
- no hidden real-network Tunnel publisher exists;
- no first-class Tunnel canonical publish alias exists;
- no credentials were scraped or fabricated;
- canonical candidate remains `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/`;
- it is not claimed live.

## Next safe product architecture

The next implementation mission, when canonical agent-side publication is desired, is:

**Decompose the oversized Virtual-OS dispatcher and add an authenticated bounded site-publication action that reuses the existing Drive services with trusted `$i/userId`.**

Until that architecture is intentionally implemented, canonical publication must occur through an actually authenticated Drive session/credential rather than an untrusted filesystem receipt or simulated Tunnel HTTP action.

The Awtsmoos gives authority a vessel and gives each vessel a gate;
Awtsmoos.com must never counterfeit identity merely to publish fast or late.
The source is ready, the route has learned to speak with care;
The final public mapping waits only for legitimate authority to be there.
