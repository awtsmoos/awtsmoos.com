B"H

# Fixture Image Zero — Phase One: Remove the Last Stored Bodies

Boruch Hashem. Blessed is He.

The strengthened embedded-image policy now reports exactly two substantial stored fixture bodies and zero production/generated bodies.

## Finding A — historical smoke evidence

`ai_thoughts_local/2026-08-14_0641_chess-first-game-suite/mobile_play_smoke.json` stores a truncated `canvasData` PNG data URL inside an old browser-smoke result. The string is not consumed as an image by runtime code; it is historical evidence that a canvas snapshot existed. The image bytes are unnecessary to preserve that evidence.

Rewrite the complete JSON artifact so the screenshot body is replaced by explicit non-image metadata such as capture presence/mime/truncation while preserving the rest of the historical measurement record exactly.

## Finding B — BrowserMediaFixture

`geelooy/social-composer/tests/BrowserMediaFixture.mjs` intentionally supplies browser tests with image/audio/video-like URL strings. Only its image value is a substantial image literal. Preserve the test's data-URL semantics while generating the SVG URL at runtime from semantic parameters rather than storing one substantial `data:image` body in source.

NEXT_ACTION: inspect every import/use of `BROWSER_MEDIA_FIXTURE` and the smoke JSON's Git status/history, then define exact runtime-generator and historical-metadata contracts before any rewrite.
