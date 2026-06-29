B"H
# Sefiros + Mediabunny Split — Research Brainstorm

## Docs absorbed
- Mediabunny is tree-shakable, zero-dependency, WebCodecs-backed, and pipelined with automatic backpressure.
- Mediabunny CanvasSource is already appropriate for our HLS streaming path.
- Mediabunny EncodedPacketSource can eventually replace webm-muxer for direct manual WebCodecs chunks, but the exact EncodedPacket bridge must be proven before making it default.
- MDN VideoEncoder queue/dequeue remains the correct manual encoder throttle.

## User intent
- Split the code into many smaller modules.
- Use Mediabunny more cleanly.
- Rename internal variables with Sefiros / Awtsmoos language.
- Keep public external APIs stable so other apps such as `apps/piano` are not broken.
- Check git/app shape and use Piano as inspiration.

## Piano inspiration
Piano already splits worker rendering into `video-worker/messages.js`, `renderLoop.js`, `state.js`, `layout.js`, and drawing modules. Nesher should mirror that small-vessels pattern: loaders, guards, state, pump, stop/finalize, track configs, target factory.
