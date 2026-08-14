B"H

Boruch Hashem

Blessed is He

# Conversation Mobile Improved File Plan

The Awtsmoos is beyond room chrome and message history, yet a mobile conversation should reveal the speech before the scaffolding. This plan narrows the broad brainstorm into small owners whose behavior can be proven independently.

## Improvements over the first brainstorm

1. Do not implement horizontal swipe-back in this phase; browser and OS back gestures are too important to risk.
2. Prefer explicit Back plus spatial enter/exit animation.
3. Make thread identity itself the collapsible object rather than collapsing the whole header.
4. Keep Back and Details permanently visible even when identity detail folds.
5. Keep room title permanently visible.
6. Move only subtitle/member-count detail behind an expand affordance on phone.
7. Let scroll activity auto-compact identity only if implementation stays event-light and deterministic.
8. Prefer tap-driven expansion first; add scroll auto-compact only if real browser evidence proves value.
9. Lower phone textarea cap below desktop 160px.
10. Keep desktop textarea cap unchanged.
11. Keep `Sending…` state in-place with no layout shift.
12. Make send button icon-capable but retain accessible text/aria label.
13. Keep Enter multiline and Ctrl/Command+Enter submit behavior unchanged.
14. Tighten continuation-message vertical rhythm more than first-in-run rhythm.
15. Preserve date divider but reduce its margins on phone.
16. Preserve author/time on first message in every run.
17. Do not hide timestamps globally.
18. Keep unread list rows at least 58px on phone.
19. Make list previews slightly more legible while preserving one-line scan speed.
20. Keep list action buttons from shrinking title column.
21. Add explicit phone-only list row CSS instead of overloading base list.css.
22. Add explicit phone-only thread rhythm CSS instead of stretching mobile-thread.css past 120 lines.
23. Keep spatial transitions transform/opacity only.
24. Use root `data-mobile-view` as the animation truth; no duplicate route state.
25. Avoid timers except finite transition cleanup if needed.
26. Let reduced-motion zero all new transitions through existing global law.
27. Keep details drawer independent from thread identity collapse.
28. Keep load-older history button visible and touch-sized.
29. Keep scroll-anchor history paging unchanged.
30. Keep all new files below 120 lines and prefer pure presentation where possible.

## New files

- `MessagingThreadIdentity.js` — phone-only identity disclosure/toggle semantics; no routing or transport.
- `thread-identity.css` — compact/expanded identity presentation.
- `mobile-message-rhythm.css` — phone message/date-divider density.
- `mobile-list-density.css` — phone conversation-list rhythm and row action geometry.
- `mobile-room-motion.css` — list/thread/special spatial transitions tied to existing `data-mobile-view`.
- `MessagingThreadIdentity.test.mjs` — identity expanded/collapsed contract.

## Existing files to rewrite

- `MessagingShellTemplate.js` — give thread heading a semantic toggle button/expanded region without changing stable IDs used by controllers.
- `MessagingElementMap.js` — expose identity toggle/detail nodes.
- `MessagingAppShell.js` or composition owner — initialize the identity controller once.
- `MessagingThreadView.js` — reset identity state when a room opens/closes; no permission logic.
- `MessagingComposerInput.js` — responsive max-height cap helper.
- `mobile-thread.css` — keep only structural mobile thread/composer controls after extracting rhythm/motion.
- `composer.css` — stronger safe-area glass, send state, phone cap visuals.
- `style.css` — explicit imports for the new small garments before reduced-motion.

## Files intentionally untouched

- private messaging server handlers;
- send protocol;
- consent/group authority;
- store history merge;
- mark-read behavior;
- shared realtime transport;
- Public Torah source publication;
- Related Torah reader intelligence.

## Browser proof goals

At 390 and 360:

- thread header stays <=64px collapsed;
- Back and Details >=44px;
- title visible at all times;
- identity detail expands/collapses without hiding title;
- thread gains vertical room when detail is collapsed;
- first message in run retains author/time;
- continuation messages remain grouped;
- message width <=92% and readable;
- textarea starts 44px and caps below half-screen;
- send stays >=48px;
- list rows remain >=58px;
- list/thread transition has no horizontal overflow;
- reduced motion removes new spatial transitions.

## NEXT_ACTION

Write a final execution contract, then implement identity semantics first so CSS can key off stable DOM rather than reverse-engineering structure later.
