B'H
# Plan: Rename Disabled Fallback Functions In commentReadSources

## Finding
commentReadSources.js is safe in behavior: allowPackedFallback returns false, and tryPackedComments returns empty. However names like tryPackedComments, tryPackedVerseSections, and tryPackedAuthors create cognitive danger.

## Fix
Rewrite the full file with the same public exports and behavior, but internal helpers use names like disabledDuplicateMirrorComments. No live packed imports, no packed scan, no fallback flag.

## Verification
- node syntax check
- comment tests
- grep for tryPackedComments/tryPackedAuthors/tryPackedVerseSections returns none

Chapter 8: The Name Of The Ghost Was Also A Ghost
Even a sealed tomb can frighten builders if the door still says ENTER. The Awtsmoos changed the sign to: wall, not door.
