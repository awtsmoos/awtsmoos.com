B"H

# Boruch Hashem — Ikar Section UX Phase Two Critique

Blessed is He.

The Awtsmoos gives abundance, and Gevurah teaches the vessel where to end;
Awtsmoos.com should become denser without becoming cramped, clearer without becoming thin.

## Critique of the first plan

The first pass assumes CSS-only repair will be sufficient. That is likely but not yet proven. A visually dense list can still fail if the semantic fallback status/description occupies too much height, if title markup is a single mixed-direction text node, or if generic premium CSS later overrides the focused rules. Therefore this pass treats card density as one part of a broader first-viewport contract.

## Thirty improvements to the first plan

1. Measure actual Chassidus section count before choosing whether search should be visible.
2. Measure actual first-view text copy before hiding or shrinking anything.
3. Do not remove semantic descriptions solely to save space; prefer shorter route-specific copy if source data supports it.
4. Keep route heading hierarchy intact for accessibility.
5. Scope all new visual rules under `html[data-heichel-experience="torah-first"]` or an equivalent Ikar marker.
6. Avoid styling all semantic discovery lists globally.
7. Preserve native anchor semantics and browser long-press/open-new-tab behavior.
8. Make the anchor `display:grid` and the list item presentation-neutral.
9. Use logical properties so RTL and LTR remain correct.
10. Avoid fixed pixel widths for the title column.
11. Let the trailing affordance shrink to content and never overlap text.
12. Keep card height compact through padding, not by clipping line-height.
13. Preserve readable Hebrew line-height even when English metadata is smaller.
14. If titles contain both Hebrew and English in one node, test `unicode-bidi: plaintext` before introducing markup changes.
15. Keep index/ordinal muted enough not to compete with titles.
16. Make focus ring visible against dark surfaces without large glow effects.
17. Use `:active` scale only if it does not cause text reflow or motion sickness.
18. Honor reduced motion.
19. Ensure filtered `li[hidden]` nodes truly collapse without list gaps.
20. Keep search status compact and screen-reader useful.
21. Avoid sticky search unless long-list scrolling proves it materially helps; sticky controls can consume mobile viewport.
22. Test long titles at 320px before considering typography complete.
23. Test mixed Hebrew-English punctuation and numerals.
24. Preserve server-first no-JS list appearance as an acceptable final experience.
25. Do not require JavaScript to add classes to each card.
26. Prefer one new focused stylesheet to editing several existing premium files.
27. Load that stylesheet through the existing Ikar premium import spine if one exists.
28. Add a source-level contract for full-card anchor geometry and responsive layout.
29. Add live HTML checks proving section routes remain anchors after styling changes.
30. Add browser geometry measurements if Chrome evaluation works; otherwise use generated CSS contract plus live HTML and manual screenshot evidence when available.
31. Re-read every touched file after write.
32. Verify no existing CSS becomes dead or contradictory enough to create specificity debt.
33. If old discovery styling becomes fully superseded, delete it only after browser proof, not in the first pass.
34. Keep each touched/new source file under 120 lines.
35. Record planned-vs-actual delta before moving onward.

## Candidate file strategy

Preferred:

- New focused stylesheet under the Heichel premium/style tree, perhaps `ikar-section-list.css`.
- One import-spine file if required.
- One focused contract test under `geelooy/heichelos/heichel/modules/test/`.

Conditional only if real evidence demands it:

- `semantic/fallback.html` for route-specific structural marker or title spans.
- `ikar-first.js` only if filtering/status behavior is still visually wrong after CSS.
- Existing premium CSS only if an unavoidable conflicting rule must be coherently rewritten.

## Rejected directions

- JavaScript click handlers around existing anchors.
- Replacing server-rendered list with hydrated custom cards.
- Generic global anchor styling.
- A large design-system refactor for one screen.
- Removing headings/status solely for compactness.
- Fixed card heights that clip bilingual text.

## Phase-two decision

The desired vessel is a compact semantic list whose entire visible card is already the link. The repair must improve first-viewport usefulness without sacrificing Torah typography, fallback usability, or the stable-geometry work that is already green.
