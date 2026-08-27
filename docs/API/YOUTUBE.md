B"H
Boruch Hashem
Blessed is He

# YouTube API

The Awtsmoos lets media move through an external provider while credentials remain a guarded key;
Awtsmoos.com gathers channel, upload, video, live, and OAuth actions in one family to see.

## Mount

`geelooy/api/youtube/_awtsmoos.derech.js` delegates to a route table beneath `/api/youtube`.

## Current route-table keys

### Root and auth

`/`, `auth/start`, `auth/callback`, `auth/status`, `auth/logout`, plus parallel `oauth/start`, `oauth/callback`, `oauth/status`, `oauth/logout` routes.

### Channels

`channel`, `channel/mine`.

### Videos and uploads

`videos`, `videos/list`, `videos/update`, `uploads/start`.

### Live streaming

`live`, `live/list`, `live/create`, `live/transition`.

## Browser surface

`geelooy/youtube/` is the primary named YouTube Manager UI found in the public tree. Streaming/broadcaster tools may also interact with provider-specific capabilities.

## Calling notes

Provider OAuth state, external API credentials, upload payloads, channel ownership, and live-state transitions are implementation-sensitive. Use the route table to locate the concrete handler before constructing a call.

## Generated reference

Every route-table key above appears under `/api/youtube/` in [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md).
