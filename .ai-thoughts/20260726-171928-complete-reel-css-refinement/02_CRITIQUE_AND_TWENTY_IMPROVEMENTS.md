B"H
Boruch Hashem
Blessed is He

# Critique and Twenty Improvements

## What the Current CSS Gets Right

- Modular ownership.
- Strong desktop/mobile structural contracts.
- Persistent timeline.
- Safe-area support.
- Track family colors.
- Small source files.

## What Must Improve

1. Too many near-identical dark colors weaken hierarchy.
2. Parent Reel and NLE palettes are related only loosely.
3. No canonical token owner exists.
4. Button states vary by file.
5. Focus-visible treatment is incomplete.
6. Inputs look denser than the surrounding panels.
7. Topbar major and minor actions have insufficient hierarchy.
8. Preview canvas lacks a polished cinema frame.
9. Generator cards feel like ordinary buttons.
10. Asset cards do not communicate type strongly enough.
11. Inspector fields need better label/value contrast.
12. Timeline ruler lacks visual cadence.
13. Track rows need stronger scanability.
14. Trim handles are functional but visually quiet.
15. Playhead needs a head marker and clearer layering.
16. Mobile action overflow is functional but visually abrupt.
17. Parent choice cards need stronger affordance and separation.
18. Progress and error states need consistent visual language.
19. Reduced-motion and forced-colors support should be explicit.
20. Hover effects should be constrained to pointer-capable devices.

## Improved Plan

- Introduce canonical CSS variables first.
- Rebuild every relevant stylesheet as a full file.
- Keep behavior selectors unchanged.
- Add state styling before decorative styling.
- Use gradients sparingly and structurally.
- Use `color-mix()` only with stable fallbacks where appropriate.
- Use `:focus-visible`, `:disabled`, `[aria-current]`, and data-error states consistently.
- Keep all pointer-only hover effects inside `@media (hover: hover)`.
- Add coarse-pointer target expansion.
- Add reduced-motion and forced-colors fallbacks.
- Use `min()`, `max()`, and `clamp()` for spacing and sizing.
- Verify desktop at 1440, 1180, 1024, and 840.
- Verify mobile at 430, 390, 360, and 320.
- Verify no overflow and timeline persistence.
- Capture screenshots before and after for evidence.
- Run parent dialog upload/create/render geometry checks.
- Run CSS ownership and line-limit tests.
