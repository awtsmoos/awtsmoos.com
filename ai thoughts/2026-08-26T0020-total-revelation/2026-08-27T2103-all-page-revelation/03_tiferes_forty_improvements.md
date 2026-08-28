B"H
Boruch Hashem
Blessed is He

# Tiferes — Forty Improvements After Critique

The Awtsmoos joins beauty with truth so polish never masks a broken gate;
Awtsmoos.com should feel immediate, resilient, and whole in every state.

1. Fix response MIME before styling the content it prevents browsers from rendering correctly.
2. Remove conflicting charset declarations and make UTF-8 canonical end to end.
3. Render meaningful dynamic Torah text on the server when data is already available there.
4. Give Heichel detail routes useful title/context/navigation before hydration.
5. Give Social Hub a signed-out/read-only shell instead of a JS-required dead end.
6. Give Apps Docs a semantic fallback body.
7. Standardize skip links and main landmarks.
8. Standardize focus-visible rings without suppressing native accessibility.
9. Define semantic layer/z-index tokens instead of page-local giant numbers.
10. Detect horizontal overflow automatically at narrow viewports.
11. Reserve modal/drawer geometry so opening controls never moves content unpredictably.
12. Ensure all fixed bottom bars respect safe-area insets.
13. Make 44px touch target a baseline for primary mobile controls.
14. Collapse secondary toolbars on mobile rather than shrinking them into unreadable density.
15. Make destructive actions visually and semantically distinct.
16. Keep loading indicators paired with readable status text.
17. Make skeletons preserve final geometry to reduce layout shift.
18. Add explicit offline/retry state to network-heavy tools.
19. Avoid loading WebGL/audio engines before intent on catalog/landing pages.
20. Budget font families and weights globally.
21. Remove duplicate route-local token declarations when shared tokens already exist.
22. Keep highly specialized game/editor CSS locally scoped instead of moving it into universal CSS.
23. Provide legacy utilities a lightweight shared header/control contract rather than importing a heavyweight app shell.
24. Preserve browser-native form/autofill behavior in login/register/wallet forms.
25. Announce asynchronous form validation to assistive technology.
26. Make auth redirects preserve intended destination safely.
27. Give transaction actions durable pending/success/failure receipts.
28. Make Torah reading width, line height, Hebrew font fallback, RTL punctuation, and footnotes intentional.
29. Preserve deep-link headings and shareable anchors.
30. Make comments/messages keyboard navigable without forcing every item into tab order.
31. Use virtualization only where lists are actually large enough to justify it.
32. Ensure search input and results remain usable before optional suggestion engines load.
33. Avoid decorative animation while user is typing, dragging, playing, or rendering.
34. Pause offscreen ambient animation and expensive observers.
35. Verify compact mode changes transport size, not application semantics.
36. Emit correct Vary/cache headers for compact/compressed negotiation.
37. Protect module URL transforms against double-compaction and query/hash loss.
38. Measure source and compact bundle bytes per representative page family.
39. Keep HTML revalidation fast while immutable fingerprinted assets use long cache lifetimes.
40. Test error pages, 404s, permission failures, and expired sessions as first-class pages.
41. Audit external wiki/proxy routes for ownership so foreign content does not inherit an unintended Awtsmoos route contract.
42. Add a public route inventory tied to representative browser smoke tests.
43. Make shared UI contracts opt-in through explicit root classes/attributes to prevent CSS leakage.
44. Prefer CSS `:where()` and low-specificity layers where supported rather than specificity escalation.
45. Confirm color contrast in both dark and light/system themes where themes exist.
46. Make reduced motion disable repeated shimmer/particle/continuous orbit effects.
47. Add printing/selection friendliness to long Torah/docs pages.
48. Ensure copy/share buttons expose success feedback without toast spam.
49. Verify browser back/forward on SPA-enhanced pages returns stable scroll/focus state.
50. Treat production console errors, unhandled rejections, 404 assets, and long tasks as release blockers when caused by our code.

## Critique conclusion

A literal every-page improvement is achievable only through invariant-driven shared foundations plus representative family proofs. A manual per-route CSS campaign would increase inconsistency, load size, and regressions. The architecture must make the good path automatic.
