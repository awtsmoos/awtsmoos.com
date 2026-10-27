B"H

# Physical Image Zero — Phase Two: Drive Rewrite Graph

Boruch Hashem. Blessed is He.

The Awtsmoos now separates archival custody from runtime continuity. Every image body will receive a verified Drive URL, but only tracked consumers will be rewritten.

## Consumer rewrite families

- Homepage/mobile dock: replace `/resources/home-icons/*.webp` with the manifest Drive URLs for the six icon files.
- Law-8 design references and real Heichel/Ikar art: replace every local/awtsmoos.com `/design-refs/law8/...` image URL with the corresponding manifest Drive URL. This includes HTML metadata, CSS `url(...)`, and JS art bases/constructed names. Constructed-path JS must become an explicit role-to-Drive-URL map so deleted local directories are never assumed.
- Feed assets: replace parchment, ornament, emoji and PWA icon local paths with Drive URLs. Shared emoji base constants must become explicit URL maps where code currently concatenates filenames; quote-card arrays become direct Drive URLs; parchment CSS becomes direct Drive URLs; webmanifest icons become Drive URLs.

## Rewrite mechanics

Generate a machine-readable text manifest from the verified archive. For each tracked consumer file, read the entire file, transform all image references deterministically from original path to Drive URL, write a complete temporary file, then atomically rename over the original. No partial range edits.

## Verification before deletion

- Grep tracked source for every original image path/basename family; no runtime local-image reference may remain.
- Scan for `data:image` and embedded base64 image payloads.
- Browser smoke home, feed, Heichel/Ikar and representative design-reference surfaces.

NEXT_ACTION: write the final deletion/regeneration plan, upload and verify all 92 images, create the manifest, then perform whole-file source rewrites from that manifest.
