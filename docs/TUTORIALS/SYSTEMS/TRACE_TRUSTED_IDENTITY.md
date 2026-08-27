B"H
Boruch Hashem
Blessed is He

# Trace Trusted Identity

Identity-shaped input is not the same thing as authenticated authority.

## Investigation path

1. Identify the transport: signed browser session, OAuth bearer, Social/Tunnel API key, or server-attached WebSocket identity.
2. Find the server-side verifier that turns credentials into an identity record.
3. Record which account/user/issuer/subject/scope fields come from that verified record.
4. Ignore request payload/query owner fields unless source explicitly verifies them.
5. Continue upward into authorization: ownership, roles, grants, scopes, permissions, origin, or room authority.
6. Check error behavior for cross-account enumeration leaks.
7. Use tests/runtime checks to prove negative cases, not only successful authentication.

## Separation rule

Authentication answers **who/what credential was verified**. Authorization answers **whether that identity may perform this operation on this resource**. Resource ownership, Heichel roles, Tunnel grants, and Mission Room admission remain separate layers.
