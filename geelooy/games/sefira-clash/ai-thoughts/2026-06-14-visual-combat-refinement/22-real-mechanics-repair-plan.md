# B"H — Real Mechanics Repair Plan

## User report
The prior v3 visual pass broke live gameplay:
- UI percentages are gone / wrong hierarchy.
- Existing top menu UI should be gone or no longer primary; percentages must replace it.
- AI is bad: bots walk back and forth on platforms, not fighting.
- Rapid fire and charged punch/lock/charge attacks don't work anymore.
- Walk animation and jump animation are gone.
- Need actual code repair, not mockup/picture.

## Root hypothesis
The v3 pass rewired render/UI only and created a new draw path, but did not respect older runtime contracts:
- UI function signatures and DOM topbar may still exist in CSS/HTML.
- V3 pose selection depends on fields that may not align with real runtime attack/control state.
- Rapid/charge input may be broken elsewhere by earlier changes, or only visually broken by pose selection.
- AI logic may not have been inspected during v3 pass; likely needs combat intent and platform traversal repair.

## Immediate inspection targets
- `index.html`
- `style.css`
- `js/main.js`
- `js/input/*`
- `js/state/*`
- `js/combat/*`
- `js/ai/*`
- `js/render/ui.js`
- `js/render/fighters.js`
- `js/render/v3/**`

## Repair constraints
- Rewrite whole files only.
- Keep files small where possible.
- Preserve mechanics and old state fields.
- Add probes for: UI top percentages, charge/rapid separation, v3 animation state, AI decision output.

## Desired behavior
- Top of canvas: readable fighter cards with damage percentages and stocks.
- Old topbar: hidden/minimal; not stealing gameplay focus.
- Bot AI: navigates toward opponents, jumps between platforms when target is above, attacks in range, recovers when offstage.
- Tap punch = rapid or normal punch; hold punch = charge punch; rapid attacks must not charge.
- Hold kick = charge kick if existing system supports it.
- Walk/run/jump/fall/punch/kick/hit animations visible in v3.
- Hit effects are clean small spark/flash, no pixel storm.

## Verification
- Run existing sim probes.
- Add and run real probes for v3 pose names, charge/rapid input, AI behavior, HUD import.
