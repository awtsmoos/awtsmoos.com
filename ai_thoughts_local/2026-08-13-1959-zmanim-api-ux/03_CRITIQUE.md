B"H
Boruch Hashem
Blessed is He

# Zmanim Phase Two — Critique and Refinements

The Awtsmoos renews every layer; critique removes the fog between promise and proof;
Awtsmoos.com should prefer a smaller verified truth over a larger ornamental spoof.

## Risks To Eliminate
1. Browser and API calculations drifting apart.
2. API accepting invalid coordinates or impossible dates.
3. Range endpoint becoming an unbounded CPU surface.
4. External geocoder or USNO outages breaking core zmanim.
5. Unknown opinion IDs silently falling back without telling API callers.
6. Timezone formatting borrowing the server timezone.
7. Date parsing shifting civil dates through UTC assumptions.
8. API responses exposing raw Date objects inconsistently.
9. A UI countdown being wrong when the selected date is not today.
10. A timeline becoming decorative but unreadable on 320px screens.
11. Segmented shita controls losing keyboard/native-select accessibility.
12. Share links failing to restore the selected coordinates after reload.
13. Location labels from URL state becoming an injection vector.
14. Copy actions failing silently on browsers without Clipboard API.
15. Current/upcoming card emphasis becoming misleading for another timezone.
16. Too many controls competing above the fold.
17. Method notes being pushed too far from the actual time.
18. Mobile fixed UI covering content or safe-area regions.
19. New components exceeding the 120-line source law.
20. API mount files turning into business-logic monoliths.
21. Alias `/api/zmanimms` diverging from canonical routes.
22. Public CORS responding incorrectly to OPTIONS.
23. External API calls allowing excessive query sizes.
24. USNO response parsing assuming a phenomenon always exists.
25. Dynamic ESM import failures becoming opaque 500s.
26. The API endpoint claiming a local rabbinic ruling.
27. Candle-lighting default being presented as universal.
28. Browser UX hiding high-latitude unavailable states.
29. Existing tests passing while new URL-state behavior regresses.
30. A beautiful UI masking API or console failures.

## Final Refinements
- Keep the native `<select>` as the authoritative form control while the richer opinion component mirrors it accessibly.
- Build next-zman status only for the selected location's current civil date; otherwise show the selected-date mode without a live countdown.
- Timeline uses a small set of major anchor events, not all 18 cards.
- Hydrate URL state for `date`, `opinion`, `lat`, `lng`, `tz`, and a bounded text label.
- Clipboard actions provide visible status and a fallback copy mechanism.
- API range maximum is 31 days.
- Invalid opinion is a 400 in API contracts instead of silent fallback.
- API daily result includes both raw ISO instants and display text for the supplied timezone.
- API warnings explicitly distinguish astronomy from halachic interpretation.
- External location endpoint limits query and result count.
- USNO remains an optional endpoint rather than part of `/day` execution.
- Every API handler returns a stable `apiVersion` and `BH` field.
- Add request examples in API README rather than editing generated docs by hand.

## Completion Standard
The work is not complete when files exist. It is complete when the dynamic server serves both canonical and alias API mounts, invalid requests fail predictably, existing and new tests pass, browser URL hydration/share/day-navigation/timeline/opinion interactions work, and mobile browser measurements remain overflow-free.
