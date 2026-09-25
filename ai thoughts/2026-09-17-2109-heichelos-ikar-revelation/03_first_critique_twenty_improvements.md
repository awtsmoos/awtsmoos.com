B"H

# Boruch Hashem — First Critique: Twenty Improvements

Blessed is He.

The Awtsmoos is beyond the plan, yet renews each measured line;
Awtsmoos.com must test its vessels until the purpose and the form align.

## Improvements to the first two passes

1. Inspect actual loaded CSS before choosing which stylesheet to rewrite.
2. Trace `_awtsmoos.index.html` through its renderer rather than assuming it is direct HTML.
3. Identify exact Ikar route syntax from code and browser before creating links.
4. Separate “Torah library” identity from “Heichel directory” identity in copy and navigation.
5. Preserve community-space discovery instead of redirecting all Heichelos.
6. Search the whole relevant `geelooy` tree for screenshot strings using an exhaustive mechanism, not a partial grep result.
7. Reproduce the `dataset` exception in the browser and capture its stack before fixing.
8. Prefer fixing the absent-element contract at the narrow ownership boundary rather than adding random optional chaining everywhere.
9. Inspect current DOM ids/classes before changing templates so dependent modules are known.
10. Trace API calls used by the generic listing before changing its rendering model.
11. Trace submission/manage links because the screenshot shows `Submit` actions that may be permission-sensitive.
12. Check authenticated and anonymous rendering assumptions where feasible.
13. Keep Ikar’s existing Torah-first modules if they already solve parts of the desired UX.
14. Avoid a second parallel Ikar implementation inside the directory page.
15. Ensure mobile redesign honors global bottom navigation and safe-area padding visible in the screenshot.
16. Verify horizontal overflow because the screenshot’s tabs already crowd the viewport.
17. Ensure all click targets remain semantic links/buttons for accessibility and keyboard use.
18. Add regression assertions for canonical Torah-library links pointing only to Ikar.
19. Add regression coverage for missing optional DOM nodes in search initialization.
20. Compare browser screenshots/DOM after implementation instead of relying solely on tests.
21. Inspect whether service workers or caches can make live verification stale.
22. Check whether CSS class names are shared across unrelated pages before renaming them.
23. Keep public API/data contracts stable even if visual modules are split.
24. Record exact files touched only after inspection, not from guesses.
25. Treat every discovered breakage as remaining work and continue until verified or genuinely out of scope.

## Revised direction

The preferred product model remains a purpose-driven Heichelos gateway with Ikar as the only Torah library, but implementation must be derived from actual route/template/runtime evidence. The search crash is a parallel defect with its own trace and test, not a cosmetic side effect of the directory redesign.
