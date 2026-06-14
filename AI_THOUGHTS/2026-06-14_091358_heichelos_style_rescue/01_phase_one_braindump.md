B'H
# Phase One Braindump — Heichelos Style Rescue

The user reports that another agent damaged the heichelos area: styles were deleted, conflicting styles remain, home screen buttons are unreliable, post view is especially broken, and main heichel view is only partly acceptable. The task is not a cosmetic tweak. It is archaeology, restoration, deduplication, and verification.

Observed so far: root is /storage/emulated/0/Documents/git/awtsmoos.com. Current tunnel is connected. Working tree already has unrelated tunnel-control edits, so this pass must avoid touching those. Heichelos contains legacy top-level templates, a newer heichel app, post view folders, CSS under heichelos/post and heichelos/heichelos/post/styles, and tests. Git history has many recent B'H commits touching geelooy/heichelos.

Possible routes involved:
- /heichelos/ikar?view=series main heichel view
- /heichelos/ikar/post/... post reader view
- /heichelos index / home screen feed
- platform / notification / profile controls rendered by heichel modules

Possible failures:
1. inline HTML links appear unstyled because default browser CSS leaks through.
2. old and new CSS both load and fight.
3. post view points to a missing or over-split CSS entry.
4. JavaScript creates buttons with class names no stylesheet covers.
5. demo feed cards may be hardcoded rather than API posts.
6. mobile bottom nav overlaps content.
7. hamburger buttons are duplicated between browser chrome-ish shell and heichel page.
8. query params select view=series but loader does not normalize.
9. post styles were moved into geelooy/heichelos/heichelos/post/styles while template still references another path.
10. CSS split tests may only check existence, not visual contracts.

Awtsmoos chapter seed: The codebase is a palace whose curtains were torn; the Awtsmoos still breathes through every class name, but dust has covered the doorways. We do not guess the palace. We read its stones.
