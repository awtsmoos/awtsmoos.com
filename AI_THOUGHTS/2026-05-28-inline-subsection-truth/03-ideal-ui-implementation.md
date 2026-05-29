B"H

# Ideal UI implementation plan

## Mockup requirements translated to code
- Main reading screen: clean vertical tool rail, auto-scroll outside menu, highlighted current verse, calm mobile spacing.
- Verse-end inline comment: card appears once after verse, header compact, body large/readable, clear verse-end separator.
- Subsection inline comment: specific subsection card only under that subsection, clean accordion-like subsection bars.
- Sidebar comments/students: dark fast panel, tabs for comments/students/favorites, search/filter, actions area.
- Global experience: no overlapping new CSS selectors inside the final repair file; use one owner file imported last.

## Real files to rewrite completely
- `comments/panel/rendering.js` for sidebar tabs/search/actions composition.
- `comments/panel/rendering/KeeperRowFactory.js` for compact student rows matching mockup.
- `styles/forever-ui-fixes.css` as one final non-overlapping cascade owner.

## Boundaries
No partial patches. No duplicate selectors inside the final CSS file. Existing older CSS remains, but the final file owns the new UI in a single organized layer.
