B"H
Boruch Hashem
Blessed is He

# System Tutorial: Authorization and Resource Ownership

**District:** security · **System ID:** `authorization-resource-ownership`

Account-scoped ownership, explicit grants, permissions, and anti-enumeration behavior above authentication.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

This packet demonstrates one inspected authorization boundary; it is not a repository-wide security audit.

## Change risk

Ownership/grant resolution and information-disclosure behavior are high-impact security contracts.

## Human manuals

- [docs/SECURITY/README.md](../../../SECURITY/README.md)
- [docs/SECURITY/TRUST_BOUNDARIES.md](../../../SECURITY/TRUST_BOUNDARIES.md)

## Related project boundaries

- `geelooy/api/tunnel` (api) — geelooy/api/tunnel
- `geelooy/api/social` (api) — geelooy/api/social

## Source anchors

- `geelooy/api/tunnel/control/core/tunnelSecurity/authorization.js`

## Generated evidence

None observed for this system packet.

## Environment-name evidence

| Name | Class | Source refs | Example sources |
| --- | --- | --- | --- |
| `AWTSMOOS_BINDING_HISTORY_PER_IDENTITY` | runtime-config | 1 | `geelooy/api/tunnel/control/core/tunnelSecurity/bindingRetentionPolicy.js` |
| `AWTSMOOS_BINDING_RETENTION_MS` | tuning | 1 | `geelooy/api/tunnel/control/core/tunnelSecurity/bindingRetentionPolicy.js` |

## Realtime application registration evidence

No versioned application registrations are attached to this packet.

## Lexical event/message evidence

None observed for this system packet.

## Tags

`authorization` · `ownership` · `grants` · `permissions` · `security`
