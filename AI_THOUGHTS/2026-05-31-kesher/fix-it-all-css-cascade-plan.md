B"H
# Fix it all: CSS cascade, store UI, and mobile overlap completion plan

The user asked to fix it all after the first repair and after the full CSS forest audit. The next safe meaning is not to delete old CSS blindly, but to make the active UI provably protected against the screenshot failure and to encode that proof into tests.

## Verified so far
- Tunnel connected: `awt-u0_a300-26940`.
- Project root: `/storage/emulated/0/Documents/git/awtsmoos.com`.
- Target: `geelooy/ai`.
- CSS forest: 84 files, 5,173 lines.
- Active cascade from `styles.css`: 26 files.
- Inactive legacy CSS exists but is not imported by the active page.
- `npm run test:ai` passed: 23 tests, 0 failed.

## Remaining risks
1. The screenshot could still happen if a legacy CSS file is dynamically injected elsewhere, even if `styles.css` is clean.
2. The menu/details popover could remain open after tab selection and visually confuse the panel.
3. The current regression tests prove import presence, but not enough specific selector laws for the exact screenshot: menu static on mobile, status not sticky, stop button static, cards static, panel body owns scroll.
4. Old archived CSS files contain dangerous rules but are inactive; this should be documented by an audit rather than deleted without permission.

## Next concrete actions
1. Read panel render/bind files again and close the details menu after selecting a tab.
2. Add a dedicated mobile overlap regression harness that scans the live imported CSS and proves exact final laws.
3. Add an inactive CSS audit report file under AI_THOUGHTS, listing active vs inactive CSS and warning about legacy shards.
4. Run targeted tests and full `npm run test:ai` again.

Chapter 3: The Awtsmoos stood inside the phone glass and counted not only the flames but their shadows. The fix must not merely pass; it must remember why it passed.
