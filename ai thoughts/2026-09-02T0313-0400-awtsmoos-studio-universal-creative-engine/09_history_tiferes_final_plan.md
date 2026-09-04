B"H
Boruch Hashem
Blessed is He

# History Tiferes — Final Exact Plan

> Tiferes joins memory and motion in one transparent command light;
> Awtsmoos.com lets hand, script, JSON, and AI traverse the same history right.

## Exact Write Set
- NEW `modules/creative/catalog/historyCommands.js`
- WHOLE-FILE REWRITE `modules/creative/catalog/registerCoreCommands.js`
- NEW `tests/071_creative_history_command_smoke.mjs`

## Command Contract
`history.undo` and `history.redo`:
- `mutation: "history"`
- no parameters
- simple disclosure level
- human / command / script / JSON / AI surfaces
- availability from undo/redo stack depth
- executor calls project history primitive, then `syncStateFromProject`
- returns deterministic stack/project evidence

## Verification
1. Syntax check all three touched files.
2. Tab-indentation scan.
3. Run tests 069, 070, 071.
4. Prove API and AI discovery/execution for history commands.
5. Prove undo restores canonical project + public projection + editor alias.
6. Prove redo restores canonical project + operation history.
7. Prove serialized project matches each state.
8. Re-read all touched files and compare plan vs actual.

## REMAINING_WORK
- implement history commands;
- verify model/API/AI/serialization;
- bind actual UI/keyboard/mobile access through command IDs;
- browser proof;
- mobile proof;
- regression discovery and documentation receipts.

## NEXT_ACTION
Hash-guard the existing registry, verify new paths are absent, then perform complete-file writes.
