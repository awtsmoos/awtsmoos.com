B"H
Boruch Hashem
Blessed is He

# Final UI Critique and Write Contract

> The Awtsmoos conceals no bug from evidence; each vessel must be read before it is renewed,
> and Awtsmoos.com should reveal one living system, not scattered fixes crudely glued.

## Thirty final checks before implementation

1. Re-read every planned file immediately before writing.
2. Verify current HTML imports and cache tokens on all public pages.
3. Verify `styles.css` import order before inserting a global release layer.
4. Keep release CSS independent and last so stale subordinate rules cannot win.
5. Avoid `!important` except for proven emergency release invariants such as menu visibility.
6. Preserve desktop reservation grid above the mobile breakpoint.
7. Collapse both reservation outer layout and field grid by 900px.
8. Add `min-inline-size: 0` to every relevant grid child.
9. Prevent textarea/select/input overflow with shared box sizing.
10. Preserve field labels and semantic markup.
11. Preserve reservation truth that submission is a request, not confirmation.
12. Keep menu controller logic unchanged unless live verification proves a controller defect.
13. Ensure every page receives the same hamburger visibility rule.
14. Preserve safe-area spacing around the fixed menu trigger.
15. Keep menu trigger keyboard/focus behavior intact.
16. Ensure release CSS does not force menu panel open.
17. Match holiday schedule by explicit civil date, never by title text alone.
18. Prefer locally approved `holidayData.js` schedule over generic weekly policy when dates overlap.
19. Preserve regular weekly policy outside holiday overlaps.
20. Do not merge zmanim values into congregation service times.
21. Ensure home preview and full Shabbos page use the same schedule resolution contract.
22. Distinguish Yom-Tov schedule provenance visually where useful.
23. Keep Chitas Ikar Hebrew as the local authoritative verse layer.
24. Remove misleading local `Chumash + Rashi` naming while Rashi is absent.
25. Remove disabled pseudo-tabs for unavailable layers.
26. Keep official Chabad handoff clear, contextual, and accessible.
27. Do not scrape, copy, synthesize or relabel English/Rashi content.
28. Correct stale README schedule language after code truth is established.
29. Re-read every changed file and line-count code modules after writes.
30. Refuse completion until live browser verification matches the intended mobile behavior.

## Whole-file rule

Every touched file will be rewritten in full. No replace-range, insertion, search/replace, or partial patch action will be used.

## Module-size rule

Every new or rewritten source-code file should remain below 120 lines. If a required behavior makes that impossible, create another small module rather than compress comments, functions, or formatting.

## Exact immediate sequence

1. Read current versions of all candidate files.
2. Reduce the write set to only files supported by those reads.
3. Write new resolver/status/release modules.
4. Rewrite their consumers/import aggregators.
5. Rewrite public entry files only if release-token coherence requires them.
6. Re-read all touched files.
7. Run syntax and structural tests.
8. Publish/refresh the Virtual OS website using the platform's existing publication path.
9. Test production and Awtsmoos publication at mobile/tablet/desktop sizes.
10. Record planned-vs-actual delta and repair anything still important.

## Deferred second mission

Only after all ten UI steps close, inspect native Awtsmoos social/auth/chat/media/blog/comment systems and create a fresh three-pass implementation plan from those actual contracts.

## NEXT_ACTION

Read the exact current UI write candidates and start whole-file implementation.
