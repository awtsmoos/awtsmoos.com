B"H
Boruch Hashem
Blessed is He

# Authentication 101

## What you will learn

Why identity, authorization, ownership, origin policy, scopes, and realtime admission are separate questions.

## Identity sources observed

- signed server session state;
- verified Social API key evidence;
- OAuth bearer evidence;
- Tunnel Control API-key evidence;
- special privileged identity checks on selected administrative routes.

## Social API keys

Social accepts key material through supported input/header/Bearer forms. The raw secret is shown when created; SHA-256 hash and metadata are persisted for verification/revocation.

## Tunnel Control

`core/auth.js` treats OAuth bearer, verified API key, or signed session state as authoritative. Browser fields such as `owner` or `userId` do not become identity merely because a client sends them.

## Resource authorization

Login is not enough for many Social operations. Heichel ownership/editor/member/moderation checks can gate writes after identity is established.

## Other gates

- Fetch checks authenticated state plus an Awtsmoos-origin condition and limits.
- `/api/admin/code` is a privileged execution surface.
- realtime Mission Rooms use origin/ticket/current-authority/version admission before handshake.

## Safe question sequence

Who are you? → what scope/role do you hold? → do you own/control this resource? → does transport/origin policy allow this request? → does current handler permit this method?

See [API Authentication](../API/AUTHENTICATION.md) and [Security](../SECURITY/README.md).
