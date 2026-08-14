B"H
Boruch Hashem
Blessed is He

# Zmanim — Third-Pass Critique

The Awtsmoos is One while the branches refine;
Awtsmoos.com must make every boundary honest and fine.

## Architecture Critique
The first architecture is strong because it is static-route native and dependency-free, but a trustworthy zmanim tool can still fail through timezone errors, polar conditions, misleading opinion labels, API CORS, inaccessible autocomplete, or untested solar math. These are not polish issues; they are correctness obligations.

## Improvements — Pass One
1. Treat the USNO request as independent validation, not a single point of failure.
2. Use NOAA equations locally for every angle so custom zmanim are deterministic.
3. Compute the timezone offset for the selected date in the location's IANA zone.
4. Never use the browser's local timezone for a searched city.
5. Normalize all internal event times as UTC `Date` values.
6. Format only at the final presentation boundary.
7. Return structured unavailable reasons for no sunrise/no sunset/no target angle.
8. Keep true sunrise/sunset calculation anchors visually distinct from published practical sunrise/sunset.
9. Do not publish hanetz amiti as a practical start time merely because it participates in formulas.
10. Put the Chabad/Alter Rebbe profile first and explain every solar angle.
11. Make GRA and Magen Avraham profiles explicit alternatives, not ambiguous toggles.
12. Put source/method notes in the UI next to opinion selection.
13. Add a two-minute safety-note callout consistent with the published calculation warning.
14. Make candle-lighting configuration clearly a common 18-minute default, not universal local custom.
15. Show Shabbos-end 8.5° separately from ordinary tzeis 6°.
16. Prevent a user from confusing civil twilight from USNO with halachic twilight.
17. Debounce geocoding and abort stale fetches.
18. Keep only textContent-based rendering for remote labels.
19. Cache the last successful geocoder query in memory for repeat searches.
20. Store only non-sensitive location preferences locally.
21. Support a query-string deep link for date/location coordinates/opinion.
22. Ensure search works with both place names and postal codes.
23. Render country/admin labels to disambiguate repeated city names.
24. Make the calendar fully keyboard navigable with arrow keys, Home/End, PageUp/PageDown, Enter/Space.
25. Preserve focus when the calendar month changes.
26. Use `aria-live` for search/status updates but not every result-card rerender.
27. Ensure all touch targets meet comfortable mobile sizing.
28. Test narrow 320px width and landscape phone layouts.
29. Use `prefers-reduced-motion` to suppress decorative transitions.
30. Keep executable modules short and single-purpose.

## Improvements — Pass Two
31. Add mathematical guards that clamp acos inputs to [-1, 1].
32. Detect polar-night/midnight-sun angle failures without NaN leakage.
33. Use two-pass NOAA event approximation to improve event-time precision.
34. Compare local published sunrise/sunset against USNO when USNO is reachable.
35. Surface the comparison delta only as a diagnostic, not as a halachic ruling.
36. Add tests for New York, Jerusalem, London, Sydney, and a high-latitude location.
37. Add invariant tests: alos < misheyakir < hanetz; minchah gedolah < minchah ketanah < plag < shkiah when all are available.
38. Add profile invariant tests for proportional-hour lengths.
39. Add daylight-saving transition-date tests using IANA formatting.
40. Make date strings ISO-local calendar dates, never parse them as UTC midnight accidentally.
41. Test leap day.
42. Avoid elevation correction unless the chosen method explicitly documents it; show elevation informationally instead.
43. Expose latitude/longitude so users can verify what location was selected.
44. Add a manual coordinates pathway later without blocking this release.
45. Keep the page useful if the USNO endpoint blocks browser CORS.
46. If geocoding fails, retain the previously selected location/results.
47. Avoid hidden automatic geolocation prompts.
48. Add a clear retry button for network states.
49. Make opinion changes recalculate locally without a network roundtrip.
50. Make date changes recalculate locally and only refresh the optional USNO check.
51. Group results semantically so the large list remains scannable.
52. Show the shaah zmanis duration in minutes.
53. Include the formula in each methodology row.
54. Label source categories: astronomy formula, halachic method, external validation.
55. Include source URLs in README, not hard-coded into every card.
56. Ensure the page has a normal heading hierarchy and landmark structure.
57. Avoid fixed-height containers that clip translations or larger text.
58. Use CSS logical properties where practical.
59. Keep error copy humane and precise.
60. Add an explicit disclaimer that practical questions and unusual latitudes require a rav.

## Completion Conditions
The feature is not complete merely when `/zmanim` renders. Completion requires source files read back, syntax tests passing, domain tests passing, real geocoder and USNO checks, browser interaction checks, mobile viewport inspection, and a final planned-vs-actual delta with all material gaps closed or documented.
