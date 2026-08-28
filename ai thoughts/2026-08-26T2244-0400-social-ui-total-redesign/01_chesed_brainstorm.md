# B"H
# Chesed Brainstorm — Social UI Total Redesign

Boruch Hashem. Blessed is He.

The Awtsmoos renews every instant; Awtsmoos.com should therefore reveal one calm intention at a time, not bury the user beneath competing chrome. The screenshot is evidence of a system-level hierarchy problem, not merely a color problem.

## User-visible failures observed from the supplied screenshot

- Too many nested bordered boxes compete for attention.
- Nearly every control is rendered as a pill/button, erasing hierarchy.
- The main authoring task is visually weaker than surrounding controls.
- Side panels remain open while the central workflow is active, creating three simultaneous attention columns.
- Tiny uppercase helper labels add noise without adding orientation.
- Decorative cyan/purple edge accents are repeated too often and become visual static.
- The destructive saved-draft action uses a reddish/pink treatment that is too prominent for a secondary destructive action.
- The giant serif headings compete with dense utility controls below them.
- Desktop information density is being forced into a mobile-width simulation.
- Preview, composer, identity, save, and publish states all appear at once instead of progressively revealing detail.

## Ideal-world possibilities

1. Establish one social design system shared by composer, feeds, profiles, destinations, media, drafts, and preview pages.
2. Introduce a single calm surface language: page background, primary surface, elevated surface, divider, text, muted text, accent, success, warning, danger.
3. Replace repeated nested cards with spacing, section headings, and one containment boundary per real responsibility.
4. Convert advanced options into drawers/disclosures instead of permanent panels.
5. Make the central composer the dominant task; preview becomes optional and collapsible.
6. Use a compact sticky action bar only for the current primary action.
7. Move destructive actions into overflow menus or explicit confirmation flows.
8. Remove decorative borders that do not communicate state or grouping.
9. Normalize controls into primary, secondary, quiet, segmented, icon, and destructive roles.
10. Use semantic z-index layers rather than arbitrary stacking.
11. Make 320/375/430 widths first-class rather than squeezed desktop.
12. Add reduced-motion and focus-visible behavior intentionally.
13. Make title/body/content blocks readable before exposing advanced metadata.
14. Unify social typography and spacing tokens.
15. Give preview a real mobile card representation rather than a parallel full editor column.
16. Collapse identity and destination into compact summary rows with edit affordances.
17. Keep media type choices visually quiet until media is actually requested.
18. Reduce default action count to the few operations needed to create a post.
19. Use neutral surfaces for ordinary controls and reserve chroma for selection and primary action.
20. Audit every social route for global CSS leakage, horizontal overflow, and accidental inherited button/input styling.

## Candidate architecture directions

### A — Cosmetic CSS cleanup
Fast but shallow. Would leave component hierarchy and information architecture broken.

### B — Composer-only redesign
Improves the photographed screen but leaves the broader social system inconsistent.

### C — Shared social design primitives + composer migration
Builds shared tokens/primitives and applies them first to the composer. Good balance of safety and reuse.

### D — Full social-system component rewrite
Potentially excellent but high-risk without first revealing the actual route/component graph.

### E — Progressive design-system migration
Reveal social routes, define a shared visual contract, migrate the photographed composer completely, then extend the same primitives into adjacent pages proven to share the same clutter causes.

## Preferred direction before repository evidence

Architecture E. It can produce a complete, visible improvement on the current screen while establishing reusable foundations for the rest of the social system without guessing at unrelated pages.
