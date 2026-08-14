B"H
Boruch Hashem
Blessed is He

# System Tutorial: OAuth Bearer Identity

**District:** security · **System ID:** `oauth-bearer-identity`

OAuth route/token surface and server-side use of verified bearer records as authoritative identity.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

A bearer token becomes identity only after server-side verification; request fields are not trusted substitutes.

## Change risk

Token validation, expiry, issuer/subject, scope, or CORS behavior is security-sensitive.

## Human manuals

- [docs/SECURITY/TRUST_BOUNDARIES.md](../../../SECURITY/TRUST_BOUNDARIES.md)
- [docs/TUTORIALS/API/OAUTH.md](../../../TUTORIALS/API/OAUTH.md)

## Related project boundaries

- `geelooy/api/oauth` (api) — geelooy/api/oauth
- `geelooy/api/tunnel` (api) — geelooy/api/tunnel

## Source anchors

- `geelooy/api/oauth/_awtsmoos.derech.js`
- `geelooy/api/tunnel/control/core/auth.js`

## Generated evidence

- [docs/GENERATED/API_TUTORIAL_INDEX.md](../../API_TUTORIAL_INDEX.md)

## Environment-name evidence

| Name | Class | Source refs | Example sources |
| --- | --- | --- | --- |
| `AWTSMOOS_BINDING_HISTORY_PER_IDENTITY` | runtime-config | 1 | `geelooy/api/tunnel/control/core/tunnelSecurity/bindingRetentionPolicy.js` |
| `AWTSMOOS_BINDING_RETENTION_MS` | tuning | 1 | `geelooy/api/tunnel/control/core/tunnelSecurity/bindingRetentionPolicy.js` |
| `AWTSMOOS_DIR` | path/storage | 1 | `geelooy/api/oauth/core/serverSecret.js` |

## Realtime application registration evidence

No versioned application registrations are attached to this packet.

## Lexical event/message evidence

None observed for this system packet.

## Tags

`identity` · `oauth` · `bearer` · `security`
