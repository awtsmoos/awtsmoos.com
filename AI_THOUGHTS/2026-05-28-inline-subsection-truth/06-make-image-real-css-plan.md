B"H

# Make the new image real: CSS-only burn and rebuild

## What the new mockup demands
- Desktop must feel like a calm parchment reader with a dark right inspector.
- Mobile must feel like a bottom drawer, not a squished side panel.
- Sidebar must have crisp top tabs, search, list cards, students, actions, and zero old beige/orange sidebar residue.
- Inline comments must be elegant: compact header, large readable body, single purple accent line, calm card spacing.
- Floating controls must not overlap content; auto-scroll is separate and visible.
- CSS must have one owner per visual domain.

## Remaining risk after previous work
The active import graph is clean for the major sidebar/inline selectors, but older global component files can still influence generic classes like `.menu-btn`, `.comment-content`, `.awtsmoos-list-item`, `.commentTitle`, or button defaults. The final ideal layer must be beautiful and precise enough to override without conflict.

## Rewrite whole files only
1. Rewrite `ideal/tokens.css` with final design tokens from the mockup.
2. Rewrite `ideal/sidebar-shell.css` as desktop inspector + mobile bottom drawer.
3. Rewrite `ideal/sidebar-panels.css` as tabs/search/student/action design.
4. Rewrite `ideal/sidebar-comments.css` as comment list design.
5. Rewrite `ideal/inline-comments.css` as compact-header large-body card design.
6. Rewrite `ideal/global-actions.css` as floating auto-scroll design.
7. Rewrite `ideal/reading-focus.css` as current verse/subsection visual focus.
8. Run syntax/tests/CSS owner checks.

No partial patching. No duplicated selectors. No placeholders.
