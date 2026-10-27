B"H

# Reader Shell Merge Conflict — Phase One

Boruch Hashem. Blessed is He.

The pre-merge forecast found exactly one path changed by both Mac image-zero history and normalized production-owner history: `geelooy/heichelos/post/_awtsmoos.post.html`.

## Complete-file evidence

Shared base `09883acc...` is 81 lines and contains an inline `data:image/svg+xml` favicon with no reader-containment stylesheet.

Mac checkpoint `1b50fdd...` is also 81 lines and changes only the favicon: the inline SVG is replaced by the verified immutable Drive object `.../sha256/32d1001068cf8be4b1599a41e065c58552fc950f77f550a0d5c8e22f851c8c56/asset`.

Normalized owner tip `7ce215cf...` is 82 lines and preserves the old inline favicon while adding exactly one stylesheet after `reader-visual-stability.css`: `/heichelos/post/styles/reader-content/reader-containment-fix.css?v=reader-containment-001`. The referenced 102-line containment stylesheet is itself added by the normalized lineage.

## Resolution law

Neither change supersedes the other. The final shell must preserve the Mac Drive favicon and the normalized owner containment stylesheet simultaneously. Every other line must remain byte-equivalent to the shared shell semantics.

NEXT_ACTION: define the exact complete resolved file and validation contract before invoking the real merge.
