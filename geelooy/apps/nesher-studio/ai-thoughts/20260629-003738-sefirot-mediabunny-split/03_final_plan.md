B"H
# Final Plan

1. Do not change any public exports consumed by Nesher or other apps.
2. Add Sefiros naming helper modules for internal naming without breaking API.
3. Split Mediabunny HLS path into loader, guards, output creation, capture, pump, and stop modules.
4. Split legacy WebM muxer path into container modules, still using webm-muxer until Mediabunny EncodedPacket bridge is verified in-browser.
5. Add tests for module exports and container configs.
6. Run forbidden `MediaRecorder` grep, syntax checks, existing smoke tests, and new smoke tests.
