B"H
Boruch Hashem
Blessed is He

# Claude DCR Confidential Client — Phase One

The Awtsmoos keeps consent guarded while each client carries the method it declares;
Awtsmoos.com must not advertise confidential registration and then refuse Claude when it dares.

## Observed production failure

- Claude custom connector selected `Register automatically` and Streamable HTTP.
- Claude displayed `mcp_registration_failed` with flow references supplied by the user.
- Production access logs show five matching `POST /api/oauth/register` requests from Anthropic egress, all returning HTTP 400 with 40-byte bodies.
- Reproducing the current Claude web DCR body with `token_endpoint_auth_method=client_secret_post` returns exactly `400 {"error":"invalid_client_metadata"}`.
- Current Awtsmoos authorization-server metadata advertises `none`, `client_secret_post`, and `client_secret_basic` as supported token endpoint authentication methods.
- Current DCR policy rejects every method except `none`.
- Current token request parser already reads `client_secret` from POST body and HTTP Basic.
- Current token route already calls `client.secretAllowed(...)` before grant execution.

## Architecture candidates

1. Tell user to supply a fixed client ID manually — avoids code but leaves advertised DCR broken. Reject.
2. Add a Claude-only static client — works around one provider and duplicates universal DCR. Reject as primary repair.
3. Support confidential DCR consistently with published metadata — preferred.
4. Add Client ID Metadata Documents immediately — valuable future work, but not necessary to repair the currently selected DCR lane.

## Security requirements

- PKCE S256 remains mandatory for dynamic clients, including confidential ones.
- Redirect URIs remain exact-bound and HTTPS/loopback validated.
- Consent remains mandatory.
- MCP resource/audience binding remains exact.
- Client secret is generated server-side with high entropy.
- Plaintext secret is returned only in the RFC 7591 registration response.
- Persistent registration storage contains only a digest of the secret, never plaintext.
- Secret comparison is timing-safe.
- Public `token_endpoint_auth_method=none` remains supported.
- `client_secret_post` and `client_secret_basic` become supported because server metadata already claims them.

## Verification target

A Claude-shaped DCR request must return 201 with a client ID and one-time client secret, the stored record must not contain plaintext secret, the resulting client must still require PKCE, wrong/missing secret must fail token exchange, and correct secret + PKCE must complete authorization-code and refresh flows.
