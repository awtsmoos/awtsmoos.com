B"H
# Nesher Engine Map

Nesher is an OBS-class live studio and Premiere-class NLE built from browser-native vessels.

Graphs:
- Scene Graph: live OBS source composition.
- Render Graph: deterministic canvas/video frame production.
- Audio Graph: buses, meters, filters, monitoring, export mix, stream mix.
- Timeline Graph: sequences, tracks, clips, trims, markers, nesting, multicam.
- Export Graph: WebCodecs encoding, muxing, validation, queueing.
- Streaming Graph: HLS sessions, provider adapters, health, tunnel relay.

Rule: no provider ingest is considered proven until codec/container/network validation proves it.
