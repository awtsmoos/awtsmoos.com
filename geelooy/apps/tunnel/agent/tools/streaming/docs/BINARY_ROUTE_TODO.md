B"H
# Binary Route TODO

Today:
- `streamingHlsSegmentPush` accepts base64 JSON.
- This is easy for browser clients but adds size overhead.

Next optimization:
- Add raw binary route in local API only:
  `POST /streaming/hls-segment/:sessionId/:name`
- Headers:
  - `x-awtsmoos-duration`
  - `x-awtsmoos-index`
  - `content-type: video/mp2t`
- The handler should call the same HLS session functions, not duplicate logic.

This keeps platform media bytes local while avoiding base64 overhead for long streams.
