B"H
Boruch Hashem
Blessed is He

# System Tutorial: Tunnel Control Identity

**District:** security · **System ID:** `tunnel-control-identity`

Tunnel Control resolves session, OAuth, or verified API-key identity into one authoritative account record.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

The identity resolver rejects browser-supplied owner fields as authority; downstream permissions remain separate.

## Change risk

Identity-source precedence, API-key verification, and account normalization directly affect authorization inputs.

## Human manuals

- [docs/SECURITY/TRUST_BOUNDARIES.md](../../../SECURITY/TRUST_BOUNDARIES.md)
- [docs/TUTORIALS/API/TUNNEL_CONTROL.md](../../../TUTORIALS/API/TUNNEL_CONTROL.md)

## Related project boundaries

- `geelooy/api/tunnel` (api) — geelooy/api/tunnel

## Source anchors

- `geelooy/api/tunnel/control/core/auth.js`

## Generated evidence

- [docs/GENERATED/API_TUTORIAL_INDEX.md](../../API_TUTORIAL_INDEX.md)

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

`identity` · `api-key` · `oauth` · `session` · `tunnel`
