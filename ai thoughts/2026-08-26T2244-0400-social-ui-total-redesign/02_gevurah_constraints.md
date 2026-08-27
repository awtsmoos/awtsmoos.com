# B"H
# Gevurah Constraints — Social UI Redesign

Boruch Hashem. Blessed is He.

Gevurah gives the design a boundary: the Awtsmoos.com interface becomes clearer not by adding ornament, but by removing what does not serve the user's next deed.

## Hard constraints

- Read every target file completely before mutation.
- Inspect direct importers/callers, shared styles, and relevant tests before rewriting.
- Do not overwrite unrelated concurrent user work.
- No partial patches, sed edits, regex mutation, or append hacks.
- Rewrite complete human-authored files only.
- Keep touched source modules <=120 lines; split responsibilities rather than compressing.
- Tabs only for indentation in touched code.
- Preserve meaningful behavior unless UX evidence justifies a behavioral redesign.
- Do not rely on broad global selectors for reusable social components.
- Mobile-first at 320, 375, 430, then 768, 1024, desktop.
- No horizontal page overflow.
- Destructive controls must be visually subordinate until intentionally invoked.
- Use semantic z-index layers and avoid arbitrary giant values.
- Include focus-visible, disabled, selected, loading, error, success states where relevant.
- Respect prefers-reduced-motion.
- Do not assume the screenshot route is the only social page; discover the actual route graph first.
- Validate with the live browser, not screenshots generated from assumptions.

## Accessibility constraints

- Maintain readable contrast.
- Do not encode state only by color.
- Preserve keyboard navigation and visible focus.
- Touch targets should remain practical on narrow screens.
- Advanced sections should remain discoverable when collapsed.

## Risk boundaries

- Existing social CSS may be global and may affect pages outside the composer.
- The screenshot may represent a local development variant (`v15live=1&width=430`) with special simulation behavior.
- Preview and editor may share markup/state in ways that constrain simple visual reordering.
- Concurrent dirty work may already exist in social files and must be preserved semantically.
