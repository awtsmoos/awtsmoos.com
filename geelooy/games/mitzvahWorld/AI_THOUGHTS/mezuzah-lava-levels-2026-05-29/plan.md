B"H

# Mezuzah, Lava, and Ladder-Level Repair Plan

## Chapter 1 — the inspected vessel
The Awtsmoos breathes through actual files, not guesses. I inspected the project root, then `geelooy/games/mitzvahWorld`, then the level registry and level JSON. The active ladder levels are loaded from `levelData.js`, which fetches JSON files from `levels/ladder/data/ladder-N.json`.

## Findings
- `levelData.js` exposes 20 JSON levels.
- `ladder-1.json` already contains `TzedakahBox` and an `InteractiveDoor` named `Inside Mezuzah`.
- Runtime export maps `InteractiveDoor` to `SimpleDoor.js`, so the JSON door is really a clickable mezuzah vessel.
- `TzedakahBox.js` sets `olam.__tzedakahBlessed = true`, but it does not directly notify mezuzahs or give a stronger visual pulse beyond its own color.
- `SimpleDoor.js` emits `navigateLevel`, but it may be missed by the UI path; it needs a robust fallback that tries multiple known level-navigation surfaces.
- `FallResetTrigger.js` resets too quickly and lacks Hebrew-letter/block explosion during the requested 3-second wait.

## Action plan
1. Rewrite complete `SimpleDoor.js` so the inside-right-post mezuzah has clear colors, tzedakah gating, stronger interaction messages, and robust navigation fallback.
2. Rewrite complete `TzedakahBox.js` so giving tzedakah marks all mezuzahs as blessed and visibly awakens them.
3. Rewrite complete `FallResetTrigger.js` so lava/fall produces Hebrew-letter and block explosion, waits 3 seconds, then reloads.
4. Generate a complete data-based pass over every `ladder-N.json` to make levels harder: more hazards, moving push blocks, trick platforms, coin traps, and ensured tzedakah/mezuzah endings.
5. Validate JSON parsing and JavaScript syntax/import shape with real commands.

No partial patching. Every changed file is rewritten as a complete vessel.