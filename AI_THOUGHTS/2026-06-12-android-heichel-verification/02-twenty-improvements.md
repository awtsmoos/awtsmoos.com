B"H
# Twenty improvement vectors

1. Remove every fixed 100vh reader shell.
2. Replace fixed reader root with min-height flow layout.
3. Remove duplicate layout systems fighting each other.
4. Consolidate scroll ownership into one CSS module.
5. Eliminate legacy sidebar overflow hidden chains.
6. Remove duplicate hero systems.
7. Audit all touch-action declarations.
8. Audit all pointer-events declarations.
9. Remove CSS specificity wars using !important.
10. Replace hidden max-height accordion hacks.
11. Unify mobile bottom nav spacing.
12. Add runtime scroll diagnostics overlay.
13. Add modal existence assertions before init.
14. Add boot health report in console.
15. Add post render count verification.
16. Verify section count equals API count.
17. Add fallback when virtualization metadata missing.
18. Remove old reader-canvas fixed positioning.
19. Create CSS architecture map.
20. Detect scroll blockers automatically at boot.

Highest suspicion remaining:
The reader still contains many legacy files with fixed positioning and overflow hidden patterns. The new scroll-root repair likely overrides them, but the architecture is still fighting itself.
