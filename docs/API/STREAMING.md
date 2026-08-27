B"H
Boruch Hashem
Blessed is He

# Streaming API

The Awtsmoos lets one stream pass through many providers while each connector keeps its own key;
Awtsmoos.com uses a dispatch layer so the human must follow provider and action before assuming what will be.

## Mount

`geelooy/api/streaming/_awtsmoos.derech.js` mounts a route table beneath `/api/streaming`.

## Public table keys

The top-level table currently exposes root and `connector` dispatch concepts. Beneath that layer, connector plugins observed in the source include Awtsmoos, Facebook, Twitch, and YouTube-oriented behavior.

## Design

This is not best understood as a static CRUD list. Requests dispatch through connector/action logic, so the route suffix, provider selection, action name, credentials, and payload shape must be read in the concrete connector module.

## Headers/CORS

The inspected derech applies public/CORS/no-store style response behavior appropriate to the connector gateway. That does **not** imply every provider action is anonymous; provider credentials or account state can still be required by the action implementation.

## Related products

Broadcaster/media tools, YouTube Manager, and streaming-related apps can sit above this layer. YouTube also has its own dedicated `/api/youtube` route table for channel/video/live management.

## Reference

Use [../GENERATED/API_FILE_INVENTORY.md](../GENERATED/API_FILE_INVENTORY.md) to see every Streaming source file and [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md) for mounted route evidence.
