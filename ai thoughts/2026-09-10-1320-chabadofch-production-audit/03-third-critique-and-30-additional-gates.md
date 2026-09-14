B"H
Boruch Hashem
Blessed is He

# Phase Three — Tiferes: Final Critique Before Source Editing

This artifact records verifiable review criteria and project decisions. It does not record hidden chain-of-thought.

> The screen is Malchus, the data its stream; a vessel must not lie for beauty's glow.
> The Awtsmoos renews the instant unseen, so every visible state must match what sources know.
> At Awtsmoos.com the paths converge; calendar, Torah, form, and menu must rhyme,
> not merely in poetry, but in contracts, focus, dates, widths, and time.

## Thirty additional production gates

1. Confirm the production page and Awtsmoos publication serve the same intended source version.
2. Detect stale cache-busting query strings or mismatched imported module versions.
3. Record every navigation destination and verify there are no orphan public pages.
4. Ensure the hamburger is present on every page, not only the home page.
5. Ensure the hamburger has an accessible name and truthful expanded state.
6. Ensure the menu can close by button, outside interaction, Escape, and navigation.
7. Ensure menu layering does not sit behind glass cards or browser chrome.
8. Ensure menu links identify the current page without disabling navigation unexpectedly.
9. Ensure browser Back closes transient UI only when appropriate and never traps history.
10. Ensure skip/navigation landmarks exist or are improved without visual clutter.
11. Check headings follow a useful document hierarchy on every audited page.
12. Check form fields use semantic input types and useful autocomplete tokens.
13. Check validation messages are visible, associated, and not color-only.
14. Check form submission preserves entered data on recoverable failure.
15. Check success/error states never claim a reservation is confirmed when it is only requested.
16. Check phone/email actions work as actual `tel:` and `mailto:` destinations where intended.
17. Check donation/payment cards state destination clearly before leaving the site.
18. Check all external links that open a new context communicate that behavior accessibly where useful.
19. Check cards never force horizontal scrolling at narrow widths.
20. Check long English, Hebrew, email addresses, and URLs wrap without breaking the grid.
21. Check Hebrew reader directionality and punctuation remain correct at all scale settings.
22. Check unavailable study tabs cannot masquerade as broken disabled controls without explanation.
23. Check official-source fallbacks preserve date/parsha/chitas context where a deep link can be verified.
24. Check holiday overlap logic handles Erev Yom Tov, first day, second day, and Shabbos intersections separately.
25. Check schedule ordering remains chronological when labels such as `Afterward` replace clock times.
26. Check the wall-calendar and This Shabbos surfaces consume one authoritative event model or a tested reconciliation layer.
27. Check New York timezone/date boundaries rather than relying on the visitor device timezone for synagogue schedules.
28. Check reduced-motion users receive immediate content with no essential transition dependency.
29. Check console/network failures do not leave skeletons, blank cards, `undefined`, or stale loading copy.
30. Re-read every changed source file and compare the final public DOM against the original failure screenshots.

## Architecture decision rule

The smallest coherent source change wins. Shared failures must be fixed in shared primitives. Page-local failures remain page-local. Platform code is touched only if source tracing proves the defect originates in the native Awtsmoos integration rather than this site's adapter.

## Stable-by-default rule

Typography, glass visual language, Hebrew rendering, existing real schedule content, established donation destinations, and working event cards remain untouched unless the live audit proves a defect.

## Completion evidence required

- Exact source-file inventory and dependency trace.
- Before/after live observations for each reproduced bug.
- Syntax/build checks where the source supports them.
- Responsive checks at representative mobile and desktop widths.
- Console/error inspection.
- Planned-versus-actual delta artifact.
- Remaining-work review with no important safe repair left open.

## NEXT_ACTION

Launch production in the tunnel browser, inventory reachable pages and behavior, then inspect the Virtual OS tree and trace each failure to source before creating the exact-file implementation plan.
