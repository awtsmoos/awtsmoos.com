B"H

Boruch Hashem

Blessed is He

# Global UI System Brainstorm

The Awtsmoos is beyond surface, focus, contrast, motion, touch, height, width, drawer, dialog, and room. Awtsmoos.com should therefore feel like one coherent social-learning instrument rather than a collection of individually polished screens.

This pass deliberately considers the whole interaction system before selecting implementation details.

## Universal interaction language

1. One unmistakable `:focus-visible` ring for every interactive control: button, link, input, textarea, select, summary, clickable row, Public Torah source card, mobile More item, room identity toggle, and modal action.
2. Never remove keyboard focus merely because pointer focus should remain quiet.
3. Add non-color focus/selection cues: ring + inset/offset geometry, not hue alone.
4. Separate hover from touch using `(hover:hover) and (pointer:fine)` so touch devices never retain fake hover states.
5. Standardize active press as a tiny finite scale/translate response where it clarifies touch.
6. Standardize disabled and busy states so controls do not merely become translucent mystery objects.
7. Keep destructive actions visually distinct without using red as the only cue.
8. Give native details/summary the same focus and touch grammar as buttons.
9. Preserve text selection, caret visibility, and accent-color coherence.
10. Keep semantic status/error/reconnect messages outside collapsible regions.

## Mobile and short-height geometry

11. Treat width and height as independent constraints; a 390x520 landscape/keyboard viewport is not equivalent to a 390x844 phone.
12. Add short-height laws for bottom navigation, modal sheets, details drawers, composer, and special-workspace headers.
13. Keep safe-area insets on all four edges, not only bottom.
14. Ensure mobile bottom navigation does not consume excessive height in landscape.
15. Let More sheet and modal sheets cap against `dvh`, not arbitrary content height.
16. Keep drawers scrollable internally while their close/header/footer remain reachable.
17. Ensure sticky regions never overlap focused inputs when virtual keyboards reduce viewport height.
18. Use `scroll-padding` so keyboard focus and anchored messages do not hide under fixed chrome.
19. Add robust min/max sizing rather than fixed-height assumptions.
20. Keep the document itself overflow-free while allowing deliberate internal horizontal roster scrolling.

## Modal and transactional UX

21. Give modal/sheet surfaces a consistent grabber/header/body/actions grammar on mobile.
22. Keep destructive/primary action hierarchy stable across confirm, invite, new chat, request, and group flows.
23. Keep form values through recoverable failures.
24. Keep error text adjacent to the action that failed and `aria-live` truthful.
25. Make modal action buttons full-width or balanced grid on narrow phones.
26. Give close buttons 44px minimum targets everywhere.
27. Constrain modal width and max-height at 360px and at 200% browser zoom.
28. Add internal scrolling before the entire dialog escapes the viewport.
29. Preserve focus trap and focus return after finite close motion.
30. Avoid animation-dependent dialog correctness.

## Details and drawers

31. Give conversation details a sticky close/header edge and sticky footer actions.
32. Keep identity/member role visible while repeated administration collapses.
33. Make details drawer full-width on phone but visually distinguish it from the room behind it.
34. Respect safe-area left/right/top/bottom in landscape.
35. Keep the details body scrollable independent of the underlying room.
36. Prevent body scroll-through while details/modal is open where current controller permits.
37. Give direct and group details the same spacing system.
38. Avoid repeated explanatory paragraphs before actual controls.
39. Keep block/leave/destructive actions reachable without scrolling past huge member lists.
40. Preserve all consent/membership truth irrespective of visual folds.

## Lists and navigation

41. Keep five primary mobile navigation doors stable and equal-width.
42. Ensure unread badges never collide with active indicator or labels.
43. Add focus-visible to rail buttons and More sheet destinations.
44. Provide a stronger current-page cue under forced-colors/high contrast.
45. Keep conversation rows 58px+ on phone and keyboard-activatable on desktop.
46. Keep preview/title/time/unread hierarchy legible at large text.
47. Allow title wrapping only where it does not destroy scan rhythm.
48. Avoid hover-only affordances for row actions.
49. Keep relationship/consent action controls >=44px.
50. Ensure list empty/loading states do not look like dead whitespace.

## Public Torah

51. Keep server-issued provenance permanently visible.
52. Give selected source result non-color geometry plus checkbox state.
53. Keep publication boundary guide collapsible but primary search/publish controls visible.
54. Ensure source links have clear focus-visible and visited semantics without weakening contrast.
55. Keep roster horizontally scrollable on phone with visible affordance that more people may exist.
56. Keep feed/privacy controls reachable at 200% zoom.
57. Keep source excerpts readable with sensible line height and no forced truncation of provenance.
58. Add high-contrast/forced-colors treatment to selected result and source cards.
59. Ensure publication result selection limit remains visible via text, not opacity alone.
60. Keep SEARCH/PUBLISH state independent from decorative animation.

## Accessibility and resilience

61. Add `forced-colors: active` support for borders, focus, selected state, destructive action, unread badge, and status signals.
62. Add `prefers-contrast: more` strengthening for muted text and borders where supported.
63. Keep `prefers-reduced-motion` as the final stylesheet authority.
64. Test at 200% zoom and large system text assumptions via responsive geometry.
65. Ensure color contrast remains sufficient when translucency/backdrop-filter is unsupported.
66. Provide solid-background fallback before translucent background declarations.
67. Avoid relying on backdrop-filter for readability.
68. Ensure `outline:0` inputs receive visible focus replacement.
69. Make summaries and icon-only buttons have accessible names.
70. Keep `aria-busy`, `aria-expanded`, `aria-hidden`, and `aria-current` synchronized with visible state.

## System tokens and visual hierarchy

71. Introduce explicit focus, danger, warning, surface, and touch-target tokens in theme ownership if not already present.
72. Standardize radius tiers rather than one-off radii.
73. Standardize elevation tiers rather than one-off box shadows.
74. Standardize muted/soft/body text contrast tiers.
75. Standardize spacing around headers, cards, actions, and dividers.
76. Keep brand accent special enough that not every border glows green.
77. Use surfaces to communicate hierarchy, not decoration.
78. Keep public/private/consent semantics encoded in copy and structure, not merely color.
79. Ensure disabled states remain readable.
80. Make every screen feel calm at rest and responsive only when touched.

## Runtime/browser proof ideas

81. 360x844 portrait.
82. 390x844 portrait.
83. 430x932 large phone.
84. 844x390 landscape.
85. 667x375 small landscape.
86. 768x1024 tablet.
87. 1200x900 desktop.
88. reduced motion.
89. forced colors emulation where CDP supports media feature.
90. increased contrast emulation where supported.
91. keyboard Tab cycle through primary nav, list, thread identity, details, composer.
92. modal focus trap and focus return.
93. no horizontal document overflow at every viewport.
94. all visible primary controls >=44px on phone.
95. special/public/online/discover/settings/mail screens remain internally scrollable.
96. details/modal max bounds remain within visual viewport.
97. room title never disappears when identity detail folds.
98. reconnect/status stays visible above every workspace.
99. no focus ring clipped by overflow-hidden parents.
100. no active/hover style shifts layout.

## Boundary

This entire pass remains presentation/interaction infrastructure. It must not alter private consent, group membership authority, message transport, Public Torah source-only publication, presence privacy, activity privacy, or the single shared social transport.

## NEXT_ACTION

Inspect current global owners, map overlapping selector responsibility, then produce a narrower improved plan that selects files and rejects ideas that would introduce duplicated state or unsafe gesture behavior.
