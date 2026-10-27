B"H

# Image Migration Recovery — Phase Two: Single-Pass Pristine Transform

Boruch Hashem. Blessed is He.

The defective first transformer reprocessed its own inserted Drive URLs because it performed many sequential string substitutions. The recovery must make reprocessing structurally impossible.

## Pristine source

For every affected tracked consumer, read bytes from the current Git object `HEAD:<path>`, never from the corrupted working file. This restores the exact pre-migration source while preserving all committed owner work on the current head.

## Single-pass mapping

Build one map of original local image expressions to verified stable Drive URLs, including:
- absolute and site-root fixed image paths;
- repository-relative Law-8 paths across parent-depth variants;
- feed CSS-relative `assets/...` paths;
- generic Law-8/parchment/ornament/icon/manuscript/emoji directory references used only in comments or dynamic image construction.

Compile the local expressions into one longest-first regular expression and call `replace()` exactly once on pristine source. Replacement text is therefore never rescanned.

After that single pass, apply only explicit semantic code transforms whose source tokens are independently asserted: cards image/video base split, kids/siyum image bases, manuscript image base, and Ikar ART_BASE. MP4 reaction URLs remain local.

NEXT_ACTION: define fail-closed validation for nested Drive prefixes, stale local image references, and exact dynamic tokens before rewriting every affected file atomically from pristine HEAD.
