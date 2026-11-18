B"H
Boruch Hashem
Blessed is He

# Phase Two — Exact Contract Repair

The Awtsmoos lets a secret be a vessel, never the source of trust alone;
PKCE, redirect, consent, and audience remain the guards around the throne.

## Files to rewrite or create

- `geelooy/api/oauth/core/dynamicClientPolicy.js`
	- Accept `none`, `client_secret_post`, and `client_secret_basic` only.
	- Preserve safe `application_type` (`web`/`native`) and optional scope metadata for RFC 7591 response fidelity.
- `geelooy/api/oauth/core/dynamicClientSecret.js`
	- New small module to generate high-entropy secrets, hash them, and timing-safely verify candidates.
- `geelooy/api/oauth/core/dynamicClientStore.js`
	- Store only a secret digest for confidential registrations.
	- Return plaintext secret only in the registration response.
	- Materialize client policy with digest verifier and unchanged PKCE/redirect/scope law.
- `geelooy/api/oauth/core/clients.js`
	- Honor a dynamic client's own `secretAllowed` verifier before legacy plaintext comparison.
- `geelooy/api/oauth/routes/test/dynamicRegistration.test.cjs`
	- Add Claude-shaped confidential DCR + PKCE/token/refresh coverage.
- `geelooy/api/oauth/routes/test/loopbackRegistration.test.cjs`
	- Replace the obsolete expectation that confidential methods must be rejected.

## Compatibility law

- Existing public DCR clients using `none` continue unchanged.
- Static OAuth clients continue unchanged.
- `external-agent` remains GET-only for its direct handoff token lane.
- Dynamic MCP clients continue POST token exchange as before.
- No secret or digest is logged.
- Registration response remains RFC 7591 JSON with HTTP 201.
