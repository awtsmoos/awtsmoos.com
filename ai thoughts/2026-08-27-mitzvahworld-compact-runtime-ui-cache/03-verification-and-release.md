B"H

# Verification and Release Covenant

The Awtsmoos creates the test and the tested in one instant; Awtsmoos.com will publish only what direct evidence can carry.

## Source gates

- Whole-file rewrites only.
- Tabs in touched source where valid.
- No minified human-authored logic.
- Touched source modules under 120 lines where practical; split responsibilities rather than compress comments.
- B"H / Boruch Hashem / Blessed is He headers and technically relevant Awtsmoos/Awtsmoos.com documentation.

## Compiler/cache gates

- CompactJS cache invalidates when entry changes.
- CompactJS cache invalidates when any transitive imported source changes.
- Same source graph with no changes reuses compilation.
- Brotli/gzip cache reuses exact compiled identity representation.
- Changed identity cannot reuse old compressed body.
- CompactCSS import folding invalidates when any imported stylesheet changes.
- Cycles/errors remain bounded and explicit.

## Runtime gates

- Generated CompactJS parses.
- Public page has zero SyntaxError/TypeError/ReferenceError/uncaught exceptions.
- Plain public URL reaches ready menu.
- Study this world reaches visible gameplay canvas.
- Mobile route reaches same behavior.
- Network shows expected `Content-Encoding` for compact generated JS when supported.

## UI/UX gates

- Primary local-world action immediately discoverable.
- Coarse pointer target >=48px.
- No horizontal overflow.
- Reasonable first-screen vertical hierarchy on mobile.
- Keyboard focus visible.
- Reduced-motion honored.
- No capability removed; secondary tools/worlds remain available.

## Release

- Rebase/rebuild on latest `origin/main` in isolated clean worktree.
- Never blanket-commit unrelated concurrent dirt.
- Exact-path stage, diff check, tests, commit, push `HEAD:main`.
- Deploy exact commit SHA through canonical remote deploy entry.
- Verify production HEAD/service and fresh public Chrome before declaring success.
