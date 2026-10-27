B"H

# Fixture Image Zero — Phase Two: Preserve Semantics Without Stored Image Bodies

Boruch Hashem. Blessed is He.

The final two findings require different treatment because one is historical evidence and one is active test input.

## Historical chess smoke artifact

Keep the complete JSON measurement structure, errors, timing, layout, human/AI state, and console summary. Replace only `afterHuman.canvasData` with explicit scalar evidence fields:
- `canvasCaptured: true`
- `canvasCaptureMime: "image/png"`
- `canvasCaptureWasTruncated: true`

This preserves what the truncated prefix proved without storing any PNG body or `data:image` literal.

## BrowserMediaFixture runtime image

Keep `BROWSER_MEDIA_FIXTURE.image` as a data URL because browser preview tests intentionally exercise data-URL media. Generate it at module evaluation time from semantic SVG geometry values and `encodeURIComponent()` rather than storing a complete encoded SVG payload in source. Audio/video fixtures remain unchanged because this task is the image-body invariant.

Before rewriting, inspect every fixture import/consumer and confirm callers require only a string URL, not byte-for-byte equality with the old SVG literal.

NEXT_ACTION: inspect all fixture consumers, then define exact test/policy acceptance before complete rewrites of the fixture module and historical JSON artifact.
