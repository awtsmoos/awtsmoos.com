B"H
Boruch Hashem
Blessed is He

# First Source Test Delta — Corrected by Origin Evidence

The Awtsmoos reveals that even a failing test can carry an older disagreement in its frame;
Awtsmoos.com records the evidence faithfully, never assigning new work an inherited blame.

## Planned

- Preserve the canonical reader shell while replacing only unconditional loading content with the safe progressive renderer.
- Preserve accessibility and auto-scroll behavior.
- Run existing reader contracts after the source-first pass.

## Actual

- `heichelosQuality.test.js` passed.
- `importedStyleOwnership.test.js` passed.
- Two `AutoScrollUI.test.mjs` assertions failed: exact 120-line template length and `aria-checked="false"` on `#focusModeToggle`.

## Origin comparison

Direct `origin/main` evidence proves:
- canonical `_awtsmoos.post.html` is 108 lines, not 120;
- canonical `_awtsmoos.post.html` does not contain `focusModeToggle ... aria-checked="false"`;
- `AutoScrollUI.test.mjs` is byte-for-byte/currently unchanged relative to `origin/main` and already expects those two absent conditions.

Therefore both failures are pre-existing upstream test/source drift. They must not be attributed to the progressive-render change and must not be "fixed" by inventing unrelated source changes during this pass.

## Delta

1. Keep the canonical template's only intended current diff: replace `loading.html` with `initial-content.html` + `$$sd`.
2. Preserve the pre-existing AutoScroll contract mismatch as discovered work for the owning reader/autoscroll stream to reconcile intentionally.
3. Add a new focused regression for the actual new behavior: semantic initial content, escaped malicious markup, loader fallback when no post exists, UTF-8-only compatibility, and reduced font request.
4. Run the new focused regression plus the quality/style tests that are relevant and currently passing.
5. Render a real direct post through the template/server path and verify the semantic body before hydration.

NEXT_ACTION: trace the actual template processor entrypoint, implement the focused initial-content regression using canonical runtime code if practical, and run it before browser verification.
