B"H

# Phase 1 — Focused Heichel Description + Modal Fix

The screenshots show two active failures: the create modal is opening by default and blocking the page, and the Heichel description is still showing script/code text instead of safely absorbing tags and whitespace. The user also clarified that the default create type being Post is wrong because posts are complex objects with verse/subsection/media systems; quick create should not pretend a post is just title + description.

Possible fixes:
- Find why the modal opens on load and make modal hidden by default unless a real user action opens it.
- Change create affordance/default to Series or a chooser that does not show simplified Post form by default.
- Remove Post from simple modal or redirect post creation to the dedicated post composer route.
- Improve description sanitizer to decode escaped HTML, remove script/style blocks whether escaped or literal, preserve meaningful whitespace/newlines, and never execute anything.
- Ensure rendering uses textContent or safe DOM fragments, not innerHTML.
- Verify URL `/heichelos/ikar/series/theOralTorah?view=series` and root view.
