B"H
Boruch Hashem
Blessed is He

# Authentication and Identity System

The Awtsmoos distinguishes who the server knows from what a client merely says;
Awtsmoos.com must preserve that boundary through session, key, OAuth, ownership, and privileged ways.

## Browser account surfaces

`geelooy/login/`, `logout/`, `register/`, and `profile/` form the visible account entry/exit/profile layer. Runtime authentication is installed by the dynamic server during initialization.

## Session identity

Derech code commonly reads server-populated request user state through `$i.request.user` or related context. Never reconstruct trust solely from body/query identifiers.

## Social API keys

Social's key helper accepts supported request fields/headers/bearer tokens, hashes secrets with SHA-256 for storage, and exposes create/list/revoke/verify lifecycle operations. Raw secret material should not be written into documentation or logs.

## OAuth

`/api/oauth` provides Awtsmoos OAuth server routes for authorization, clients, start, token, current identity, and logout. Provider-specific OAuth also appears in YouTube.

## Tunnel Control identity

Tunnel Control `core/auth.js` resolves identity from trusted OAuth bearer evidence, verified API keys, or signed session state. It explicitly rejects browser owner/user fields as authoritative ownership.

## Ownership after authentication

Authenticated does not mean authorized for every object. Social aliases, Heichelos, posts/comments, Tunnel grants/devices, and administrative routes apply additional ownership/scope/privilege logic.

## Special privileged surfaces

`/api/admin/code` contains a direct special-user check before submitted code execution. Public DB mutation also has a privileged identity condition. These should receive focused security review when touched.

## External-provider credentials

YouTube, PayPal, SSH, streaming connectors, AI, email, and Tunnel/provider systems may use additional credentials beyond the main Awtsmoos identity. Document mechanisms and variable names only when useful; never copy live secret values.

## Checklist for a new protected route

1. Define the trusted identity source.
2. Define required scope/role/ownership.
3. Reject client-claimed ownership as authority.
4. Validate target resource ownership after login.
5. Define API-key/OAuth behavior intentionally rather than accidentally inheriting it.
6. Add negative tests for unauthenticated and wrong-owner cases.
