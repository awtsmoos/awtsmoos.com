B"H
Boruch Hashem
Blessed is He

# Security and Trust

Security questions must preserve distinct layers: **authentication, authorization, resource ownership, scopes/grants, origin policy, and realtime admission are not interchangeable**.

## Interactive system map

Open `/docs/?view=systems&systemDistrict=security` for curated trust systems joined to bounded source/project/environment-name evidence.

## Human manuals

- [Trust Boundaries](TRUST_BOUNDARIES.md)
- [Realtime Security](REALTIME_SECURITY.md)
- [Secrets and Config](SECRETS_AND_CONFIG.md)

## Identity sources

Current inspected source includes signed sessions, OAuth bearer records, verified API keys, and server-attached WebSocket identity. Identity-shaped request fields are not authority unless server verification explicitly establishes them.

Use [Trace Trusted Identity](../TUTORIALS/SYSTEMS/TRACE_TRUSTED_IDENTITY.md) to follow verifier → authoritative identity → authorization → ownership/grants → negative cases.

## Secrets/config evidence

Generated documentation records environment variable **names, classifications, source-reference counts, and example source paths only**. It does not read `.env` files or publish values.

## Security-evidence boundary

System/route/project packets help locate trust boundaries. They do not constitute a security audit, vulnerability assessment, or proof that authorization is complete.
