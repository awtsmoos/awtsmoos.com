B"H
Boruch Hashem
Blessed is He

# Trust Boundaries

The Awtsmoos gives every identity its true source while Awtsmoos.com refuses to turn user-shaped input into server authority merely because the names resemble one another.

## Layer 1 — transport/session authentication

The dynamic server installs one Auth instance as HTTP session middleware and also exposes it to the WebSocket server. This establishes trusted request/socket identity from the configured authentication covenant rather than application body fields.

## Layer 2 — alternate authenticated credentials

Some API families accept additional credentials:

- Social can verify revocable API keys.
- Tunnel Control can resolve OAuth bearer records.
- Tunnel Control can verify its own API keys.
- Provider APIs can require external provider credentials in addition to Awtsmoos identity.

Each mechanism has its own storage, lifecycle and scope semantics. Do not substitute one credential family for another without source support.

## Layer 3 — resource authorization

After authentication, the application must still authorize the target action. Examples include:

- alias ownership or permission;
- Heichel editor/owner/governance roles;
- post/comment moderation or ownership;
- Tunnel device/grant/scope checks;
- Mission Room `tunnel.mission` permission;
- privileged administrative special-user checks;
- provider/channel/order ownership.

## Client input is not authority

Query/body/route values such as `userId`, `accountId`, `owner`, `alias`, `heichelId`, `tunnelName`, `deviceId` or `roomId` locate or describe a resource. They do not become authoritative identity until matched against trusted server state and permission rules.

Tunnel Control's inspected auth source is explicit: current identity comes from OAuth, verified API key or signed session. Browser-submitted ownership fields are not an authority source.

## Social API keys

The Social helper creates a random raw key, stores a SHA-256 hash plus metadata, and returns the raw secret on creation. Verification hashes the supplied key and uses both an index and the owning key record. Revocation timestamps are checked in both places.

## Re-check mutable authority

Long-lived flows should not assume permissions never change. Mission Room upgrade policy consumes a one-time ticket and then re-checks current tunnel mission authority before the handshake. The ticket's authority must still match current authorization.

## Review checklist

For every protected operation, identify:

1. trusted identity source;
2. resource identifier source;
3. authorization function/check;
4. scope/role/ownership requirement;
5. revocation/expiry behavior;
6. negative tests;
7. data or provider side effects.
