B"H
# Long Recording Design

Current Nesher behavior:
- Video frames are sent one at a time to the existing MediaBunnyBase worker.
- MediaBunnyBase keeps only a small frame queue.
- Final MP4 bytes are written through an IndexedDB range target in the shared video library.
- Captured tab audio is stored as PCM packets in IndexedDB while recording.

This avoids the main RAM traps during recording.

Remaining limitation:
- The current shared finalize API expects one AudioBuffer-like shim, so final muxing materializes audio once at the end.

Future true segment mode:
- Finalize a fragment every 30-120 seconds.
- Store fragments in IndexedDB.
- Stitch using a same-codec fragmented-MP4 concat action, not by decoding/re-encoding.
- This belongs in `/scripts/awtsmoos/video`, so all apps benefit.
