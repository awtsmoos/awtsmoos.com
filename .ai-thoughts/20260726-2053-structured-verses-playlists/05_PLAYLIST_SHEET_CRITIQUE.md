B"H
Boruch Hashem
Blessed is He

# Playlist Sheet Critique

## Problems to Avoid

1. Do not commit destination state merely by inspecting a Heichel.
2. Do not expose denied destinations in quick selection.
3. Do not duplicate the existing advanced destination tree.
4. Do not make the sheet depend on all nested series being preloaded.
5. Do not place creation policy fields inside the quick sheet.
6. Do not lose keyboard focus when the sheet closes.
7. Do not make desktop users interact with a tiny mobile-only control.
8. Do not let search silently change canonical selection.
9. Do not render server labels through HTML.
10. Do not allow stale async Heichel detail responses to replace newer navigation.

## Improved Design

- Use one native dialog, rendered as a bottom sheet on phones and centered modal on desktop.
- Show writable Heichelos first.
- Load one Heichel detail only after selection.
- Show root plus flattened nested series with breadcrumb depth.
- Search filters current-level items only.
- Show a checkmark beside the current canonical destination.
- Commit only after clicking a series row.
- `New series` reveals and focuses the existing creation panel.
- `Browse all` reveals the complete advanced destination tree.
- Escape, Close, and backdrop click restore focus to Change series.
