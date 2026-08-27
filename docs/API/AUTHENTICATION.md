B"H
Boruch Hashem
Blessed is He

# API Authentication and Authority

The Awtsmoos distinguishes identity from a field a browser merely claims to own;
Awtsmoos.com must derive authority from trusted evidence before a privileged path is shown.

## Global runtime identity

The dynamic server installs authentication during initialization. Individual derech families then read request/user state and apply their own rules. Therefore auth classification is **per endpoint/family**, not a blanket assumption for all `/api`.

## Social API

`geelooy/api/social/helper/general.js` considers a request logged in from server request-user state. Social can also resolve a revocable API key through `helper/apiKeys.js`.

API key inputs observed:

- input field named `apiKey`;
- header `x-awtsmoos-api-key`;
- `Authorization: Bearer ...`.

Keys are SHA-256 hashed for storage; the raw secret is shown on creation rather than stored as plaintext metadata. The helper provides create/list/revoke/verify behavior.

## Tunnel Control

`geelooy/api/tunnel/control/core/auth.js` treats identity as server authoritative. It can resolve:

- OAuth bearer evidence;
- verified API-key evidence;
- signed session identity.

It does **not** treat browser-submitted owner/user fields as authoritative identity. Tunnel scopes include read/write/admin concepts. API keys can arrive through supported query/body names and headers such as `x-awtsmoos-api-key` or the Awtsmoos key scheme implemented in source.

## Explicit privilege examples

- `/api/admin/code` checks a privileged user identity (`$u.info.entry === "asdf"`) before executing submitted code. This is security-sensitive by design and must not be treated as a normal utility endpoint.
- `/api/public` mutation behavior is privileged to the user identity checked in its derech; public reading and mutation are not equivalent privileges.
- `/api/fetch` requires authenticated state and checks an Awtsmoos-origin condition before proxying outbound requests.

## Public/intentionally distributable surfaces

Tunnel installer artifacts are designed to be fetched publicly and use permissive download/CORS behavior. OAuth authorization/start flows and other public routes may intentionally begin without an existing application session, but downstream token/client rules still matter.

## Calling safely

1. Locate the exact endpoint in the generated atlas.
2. Read the source handler or route-table function.
3. Identify `loggedIn`, OAuth, key, scope, ownership, origin, or special-user checks.
4. Do not infer authority from an input field named `owner`, `userId`, or `alias`.
5. For write routes, inspect ownership checks on the target object as well as login state.

## Secrets

Documentation intentionally describes secret *locations and mechanisms*, not secret values. Never add live API keys, OAuth secrets, cookies, private tokens, or machine credentials to docs.
