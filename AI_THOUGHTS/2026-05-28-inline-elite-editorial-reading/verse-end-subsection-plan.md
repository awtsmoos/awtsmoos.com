B"H

# Verse-End Subsection Placement Plan

## User Rule
All comments for a verseSection belong together at the end of that verseSection unless the comment contains explicit dayuh info for a specific subSection.

## Meaning
- Comment with `dayuh.subSection: 1` belongs beside subsection 1.
- Comment with `dayuh.subSection: 0` belongs beside subsection 0.
- Comment with no `dayuh.subSection`, `null`, `main`, or `root` belongs to the verse-level cluster once at the end of the verse section.
- URL `?idx=0&sub=1` must show exact subsection 1 comments plus the verse-level end cluster, not sibling subsection 0 comments.
- The fetch should request verse 0, not only sub 1, because the client must receive both exact subsection and verse-level comments.

## Files
- `bulk/urlScope.js`: include exact sub plus main/root when sub is requested.
- `bulk/requestBatch.js`: do not send `subSection` in API request; fetch verse and filter client-side.
- `anchors/resolveCommentAnchor.js`: main/no-sub comments resolve to verse element itself, not `.toichen`, so shelter appends at section end.
- `bulk/test/urlScopeSubsection.test.mjs`: update expected behavior.
- `anchors/test/resolveCommentAnchor.test.mjs`: add no-sub verse-end behavior.

## Verification
- node --check modified JS files.
- node --test existing required tests plus updated urlScopeSubsection test.
