B"H
Boruch Hashem
Blessed is He

# Phase Three — Final Critique and 32 Further Improvements

The Awtsmoos renews even the improved plan; the third look must still be willing to break it;
Awtsmoos.com should ship only what real daily use can justify, then verify every state we make it.

1. Do not redesign the calculation engine.
2. Do not change API contracts in a visual pass.
3. Preserve URL hydration exactly.
4. Preserve owned calendar keyboard behavior.
5. Preserve rich shita keyboard behavior.
6. Calendar collapse state should not enter share URL; it is ephemeral UI state.
7. Recent-place storage should be bounded and failure-safe like existing preferences.
8. Recent-place chips should use textContent, never remote HTML.
9. If the current selected place is already in recents, do not duplicate it.
10. The control deck should render without requiring recent-place data.
11. The date trigger must expose `aria-expanded` and point to the calendar region.
12. Calendar disclosure should open when a user explicitly invokes date selection and close after a date is selected.
13. Day Previous/Next actions should not unexpectedly open the calendar.
14. Today button should be visually secondary, not the only dark button in the control deck.
15. Shita selector descriptions should move to methodology so the compact switch remains scan-friendly.
16. Keep a hidden/native select if current integration/tests depend on it.
17. Key times must come from canonical calculated times and a declarative ID list.
18. The key-times component should show unavailable states explicitly at high latitude.
19. The next-zman contextual previous event must derive from sorted available events, not hardcoded IDs.
20. The timeline should avoid absolute labels that collide at 320px; five evenly distributed text cells remain safer.
21. Current marker must clamp to track bounds.
22. The sticky context must not duplicate the full control deck and should be hidden near the top.
23. A sticky bar driven by IntersectionObserver adds complexity; use CSS sticky on a concise context row that is naturally positioned after controls.
24. Reduce border radius globally, but keep enough softness for touch-oriented UI.
25. Keep warning colors contrast-safe.
26. Ensure selected shita segment has both color and `aria-checked` semantics.
27. Recent-location chips must be buttons with accessible names.
28. Search result list must remain keyboard-operable after layout rewrite.
29. Copy feedback remains `aria-live`.
30. Add tests for recent-location deduplication and key-time selection.
31. Browser verification must cover calendar open/close, recent place selection, shita keyboard movement, no-overflow, and full list count.
32. Final screenshot should be inspected at 390px and desktop to judge hierarchy, not only DOM metrics.

## Final revelation
The correct third pass is not "more features." It is **less simultaneous interface** plus two high-value conveniences: a key-times layer and recent-place shortcuts. The page should become shorter, calmer, and faster without removing any of its existing verified depth.
