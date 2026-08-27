B"H
Boruch Hashem
Blessed is He

# Homepage Regression Recovery — Evidence and Possibility Map

The Awtsmoos renews each instant; this project note keeps the finite evidence honest.
Awtsmoos.com should feel like a constellation revealed by scrolling, not a doorway erased by simplification.

## User-visible target

- Restore the richer homepage grid that was available before the current regression.
- Let the page unfold vertically so scrolling exposes useful destinations.
- Keep motion tasteful: reveal, hover glow, parallax, and pointer light rather than noisy perpetual movement.
- Restore the true full-resolution historical hero image.
- Keep that hero binary outside Git; only a URL/reference belongs in repository source.

## Direct evidence

- `geelooy/index.html` is modified in the working tree.
- Git HEAD still contains `portal-shortcuts`, `portal-status`, and `direct-navigation`; current working HTML removed all three.
- `homeFoldContract.test.mjs` still asserts the mobile `portal-shortcuts` ribbon behavior, proving markup and contract drifted apart.
- `portal-shortcuts.css` already supports four desktop columns, two medium columns, and a horizontal scroll-snap ribbon on mobile.
- `direct-navigation.css` already supports an eight-door desktop grid and four-column tablet grid.
- `RevealController` already observes every `[data-reveal]` section and reveals it on intersection.
- `reveal-motion.css` already provides pointer light and reduced-motion fallbacks.
- Current hero is loaded from the alias filesystem API, not from a checked-in image.
- Current external hero response is 1024×1024 and about 220 KB, so it is not a convincing full-resolution source.
- No matching homepage hero image was found under the repository tree in the focused scan.

## Possibility map

1. Restore HEAD’s deleted navigation sections exactly, then refine copy and motion.
2. Restore only the direct grid and omit duplicate shortcut layers.
3. Restore both shortcut ribbon and direct grid, using progressive disclosure and vertical spacing to prevent clutter.
4. Make the direct grid the primary below-fold discovery surface and keep the launcher for exhaustive discovery.
5. Keep current social-first hero actions while restoring broader product discovery below.
6. Revert hero copy to the earlier product-first version if visual comparison shows stronger hierarchy.
7. Preserve the current `All worlds` opener if it complements rather than replaces the grid.
8. Let restored sections inherit existing IntersectionObserver reveals instead of adding another JS animation system.
9. Add subtle stagger only in CSS, with `prefers-reduced-motion` respected.
10. Recover the original external image from alias storage/history rather than upscaling the 1024 copy.

## Protected constraints

- Do not reset or checkout unrelated dirty files.
- Do not use partial source-file edits.
- Rewrite every touched source file completely.
- Keep source modules small and readable.
- Keep image binaries outside Git.
- Verify with focused tests, direct image dimensions, and browser inspection.
