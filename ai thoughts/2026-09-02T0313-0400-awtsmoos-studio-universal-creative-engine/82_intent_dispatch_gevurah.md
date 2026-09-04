B"H
Boruch Hashem
Blessed is He

# Intent Dispatch — Gevurah Risks

> Gevurah guards one grammar repair from becoming a navigation rewrite, for the navigator already knows how each lazy room should descend;  
> the Awtsmoos keeps this change at the semantic seam, while Awtsmoos.com preserves every error and focus boundary from end to end.

## Risks
1. Do not change IntentContentModel labels/pages; the model is already coherent.
2. Do not bypass `onBeforeLeave`, because intent-sheet focus and dismissal depend on it.
3. Do not call the feature loader directly; `navigator.openPage()` remains the navigation/lazy-loading owner.
4. Preserve legacy shapes so no hidden caller regresses.
5. Unknown actions must still report through `setStatus` and `setSheetStatus` rather than throw out of the event boundary.
6. Existing dispatcher file SHA must match the observed `75e3321cee45a9d732879dcf99dbda4845d58ca48bc2e1afb6c77b66cab48008`.
7. Test 083 must be absent immediately before creation.
