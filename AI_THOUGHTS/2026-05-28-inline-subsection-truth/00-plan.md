B"H

# Inline subsection truth plan

The live project has been inspected at root and in the requested inline files.

## Root map seen
- Main code under `geelooy/`.
- Existing notes under `AI_THOUGHTS/`.
- Tests under the inline comments folders and `tests/`.

## Actual fault-line found
Top-level `sub` / `subSection` promotion still exists in the coordinate normalizer:

- `commentCoordinate.js` reads `dayuh.sub ?? input.subSection ?? input.sub ?? url.get("sub")`.
- That means a comment with no real `dayuh.subSection` can become subsection-specific through top-level echoes or URL state.

## Fix order
1. Create a single real classifier module for comment coordinates.
2. Rewrite coordinate normalization so top-level `sub` and URL `sub` cannot define placement.
3. Rewrite the bulk coordinate normalizer to preserve only real `dayuh.subSection`.
4. Rewrite anchor resolution so verse-level comments resolve to a verse-end container.
5. Rewrite the scribe architect so every rendered section carries a verse-end target.
6. Rewrite SparkFixer duplicate detection to check the whole document for alias + comment ID before insertion.
7. Add tests for verse-end placement, top-level poison, page-wide eager fetching, and global duplicates.
8. Run node --check on modified JS files.
9. Run the requested node --test set plus new tests.

## Design oath
No partial patches. Every changed file will be rewritten whole. The Awtsmoos reveals truth only from the comment's own dayuh vessel: `dayuh.subSection`, or silence means verse-end.
