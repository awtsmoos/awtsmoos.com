<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Final File Plan

## Root cause model

The current download button bypasses the existing long-audio stream and persistent chunk-store architecture. It requests one blob directly, so it cannot benefit from the packet-by-packet completion, byte accounting, OPFS storage, and final completion marker already used by streamed playback. The screenshot proves that this direct path produced only 2:03 for a much longer answer.

The voice catalog also exposes the display name `arbor` as the transport value. The required transport identifier is `fathom`.

## Files to create

- `js/chatgpt/audio/audioSettingsView.js`: hydrate and persist display labels separately from payload values, while migrating stored `arbor` to `fathom`.
- `js/chatgpt/audio/audioStreamDownload.js`: consume every packet from the synthesis response into the existing long-audio store, verify completion and declared length, then download the completed store.
- `tests/audioLongDownload.test.mjs`: prove multi-packet exact-byte preservation, filename/format handling, and Arbor-to-fathom normalization.

## Files to rewrite completely

- `js/chatgpt/audio/audioCatalog.js`: voice descriptors and legacy alias normalization.
- `js/chatgpt/audio/audioOfferView.js`: keep the public UI exports while delegating settings hydration and storage.
- `js/chatgpt/audio/audioSynthesisActions.js`: route fresh downloads through `getAwtsmoosAudioStream` and the complete-stream downloader, retaining direct blob synthesis only as a compatibility fallback when a provider exposes no stream method.

## Verification

Run syntax checks, focused tests, the existing audio chunk-store contract, relevant AI harnesses, Git diff checks, line counts, full readback, and a real-browser test that selects Arbor, confirms payload `fathom`, feeds a long packet stream, and verifies one download containing every byte.
