B"H

Boruch Hashem

Blessed is He

# Phase One — Expected Files and Surfaces

The Awtsmoos is one while modules are many; this list is a hypothesis map for Awtsmoos.com, never permission to edit a path before its whole contract is read.

## Likely server surfaces
- `ayzarim/awtsmoosDynamicServer/websocket/apps/universalChat/**`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/privateMessaging/**`
- WebSocket router and application registration files.
- Meaningful activity services, routes, and hooks.
- Torah RAG/search services and routes.
- Recommendation/discovery services if already present.
- Notification/inbox integration points.
- Mail reference and deep-link integration points.

## Likely browser surfaces
- `geelooy/scripts/awtsmoos/realtime/**`
- `geelooy/scripts/awtsmoos/social/universalChat/**`
- `geelooy/scripts/awtsmoos/social/privateMessaging/**`
- Dedicated `/apps/universal-chat/` HTML, JavaScript, and CSS modules.
- Global `/register.js` or imported shell modules.
- Heichel post/comment renderers and reading observers.
- MitzvahWorld social inheritance entry.
- Shared social launcher and presence UI modules.

## Likely tests
- Browser static import closure.
- Shared realtime lifecycle and reconnect.
- Public chat security, pagination, and index concurrency.
- Presence.
- Private consent, groups, and request dedupe.
- Meaningful activity capture preferences.
- Live WebSocket and RAG integration.
- Controlled Chrome/CDP responsive and runtime proofs.

## Touch rule
The final touched-file list will be written only after complete reads of each candidate plus imports, callers, and relevant tests. Every modified source file is rewritten whole and kept under the 120-line source ceiling by meaningful modular splits.
