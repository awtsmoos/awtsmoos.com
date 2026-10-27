B"H

# Embedded Image Zero — Phase Two: Archive Only Stored Runtime Bodies

Boruch Hashem. Blessed is He.

The Awtsmoos gives the migration law for substantial literal payloads detected by the existing embedded-image policy.

## Exact custody

For each unique substantial production/runtime literal:
- decode the literal in memory only;
- compute SHA-256 and exact bytes;
- use the existing content-addressed public Drive namespace `repo-image-archive/sha256/<sha>/asset` when the same bytes already exist;
- otherwise upload through the authenticated TEST alias with public visibility and exact MIME;
- public-read the object and verify hash and byte count before any source rewrite.

Create a separate compact tracked manifest for embedded runtime literals if adding them to the 92-entry physical-image manifest would exceed 120 lines. The manifest records source locations, SHA, bytes, MIME and verified public URL.

## Whole-file rewrites

Rewrite each source file completely from its current validated contents, replacing only the exact stored literal with its verified Drive URL. Duplicate literals reuse the same object. CSS `url(data:...)`, favicons, masks and runtime constants become remote URLs while preserving surrounding semantics.

## Explicit non-migration cases

- Test fixtures whose purpose is testing data-URL behavior remain fixtures.
- Parsers/regex/prompt text mentioning the syntax remain unchanged.
- Runtime screenshot/BMP/canvas encoders that dynamically construct a data URL remain unchanged.
- Generated docs/search files are regenerated from corrected sources rather than manually rewritten.

NEXT_ACTION: enumerate policy findings with source role, hash unique substantial production literals, upload/verify missing Drive objects, and prepare exact whole-file replacement mappings before source mutation.
