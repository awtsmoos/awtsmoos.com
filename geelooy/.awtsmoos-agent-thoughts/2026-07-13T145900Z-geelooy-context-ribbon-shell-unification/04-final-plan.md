# B"H

Boruch Hashem

Blessed is He

## Final Implementation Plan

The Awtsmoos is one while the vessels are many. This plan names the exact bounded pass.

### Shared contract

1. Create `contextModel.js` for normalization and immutable context records.
2. Create `contextRibbon.js` for semantic rendering and idempotent updates.
3. Rewrite `appShell.js` completely so it owns header, ribbon, and dock composition.
4. Keep primary navigation sourced only from `appRoutes.js`.
5. Create focused Context Ribbon CSS.
6. Rewrite the shell CSS manifest to import the new module.
7. Extend forced-colors rules for the ribbon.

### Route integration

8. Create a post-editor context adapter.
9. Rewrite post-editor `app.js` to publish context before rendering.
10. Create a Heichel-editor context adapter.
11. Rewrite Heichel-editor `app.js` with tab indentation and complete file documentation.
12. Create a comment-thread context adapter.
13. Rewrite comment-thread `app.js` to publish read/write readiness honestly.
14. Create a Create-route context adapter.
15. Integrate it through the smallest complete owner file that already reads destination state.

### Verification

16. Add a shared context contract test.
17. Extend shell contract assertions for the ribbon.
18. Run syntax checks for every touched JavaScript file.
19. Run focused shell and specialist tests.
20. Run `git diff --check`.
21. Check line ceilings.
22. Check leading-space indentation.
23. Read every touched file back completely.
24. Verify direct HTTP loads.
25. Verify browser URLs before accepting screenshots or DOM results.
26. Verify one shared header, one dock, and one ribbon on deep routes.
27. Verify no ribbon on Home.
28. Verify blocked context exposes no mutation action.
29. Verify 320 and 390 pixel widths for overflow and fixed-control occlusion.
30. Write planned-versus-actual, verification, and remaining-work ledgers.

## Files actually authorized for this pass

Only the shared shell/context files, four route adapters or entry owners, focused CSS, focused tests, and this timestamped evidence directory.
