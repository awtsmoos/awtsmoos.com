B"H

# Fixture Image Zero — Phase Three: Total Substantial Literal Count Zero

Boruch Hashem. Blessed is He.

The Awtsmoos gives the final fixture gate: tests may still generate or consume image data URLs at runtime, but tracked text must not warehouse a substantial pre-encoded image body.

## Rewrite contract

- Read every `BROWSER_MEDIA_FIXTURE` importer before mutation and prove callers depend on URL behavior/type, not exact historical SVG bytes.
- Fully rewrite `BrowserMediaFixture.mjs` so the image fixture is generated at module evaluation from semantic SVG geometry and an `image/svg+xml` MIME assembled without a stored substantial `data:image` literal.
- Audio/video fixture strings stay unchanged because they are outside the image-body invariant.
- Fully rewrite `mobile_play_smoke.json`, preserving all historical measurements while replacing `canvasData` with `canvasCaptured`, `canvasCaptureMime`, and `canvasCaptureWasTruncated` scalar evidence.

## Acceptance

- JSON parses successfully and retains all non-canvas historical values.
- Browser media fixture remains <=120 lines and syntax-clean.
- Importing the fixture yields an image string beginning with `data:image/svg+xml` and audio/video strings unchanged in type.
- Relevant social-composer browser/media tests pass.
- Strengthened embedded-image policy reports zero findings total across production, generated, fixtures, and historical evidence.
- Policy unit tests remain 6/6.
- `git diff --check`, repository hygiene, tracked-image count zero, and manifest counts 92/36 remain green.
- Both rewritten files are reread completely and a postwrite delta records the final zero-storage proof.

NEXT_ACTION: inspect all BrowserMediaFixture consumers and the historical artifact's Git state, then whole-rewrite exactly those two files and run the total-zero acceptance gate.
