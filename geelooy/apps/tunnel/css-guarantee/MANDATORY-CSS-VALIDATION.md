# B"H — MANDATORY CSS VALIDATION (Yaakov 2026-10-08)

## Standing Order

**No tunnel connection may deploy, write, or modify CSS without running the contrast validator first.**

This is not advisory. This is blocking. If the validator fails, the work stops.

## Why

On 2026-10-08, the Meluket reader shipped with white-on-white text in Light theme:
- Scribe's Lens settings panel labels invisible (white on light)
- Series page headings invisible (white on light)  
- Reader CSS not loading (`css: false` in console)

The validator exists to prevent this. It must run before every CSS change.

## How

```bash
node geelooy/apps/tunnel/css-guarantee/contrast-validator.mjs <css-root>
```

Exit code 0 = pass. Exit code 1 = fail, BLOCKED.

## What It Checks

1. White text (`#fff`, `white`) inside light-theme scopes without dark background
2. Missing light-theme overrides for dark-theme text colors
3. Hardcoded colors that break theme switching

## Tunnel Instructions

Every tunnel agent MUST:
1. Run the validator before writing CSS
2. Run the validator after writing CSS  
3. If it fails, fix the issues — do not deploy
4. Never bypass with "advisory" or "fail-open" modes

**No tunnel connection will ever let bad CSS slide.**
