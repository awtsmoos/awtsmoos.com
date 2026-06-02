B"H

# Tiferes Tunnel Control final verification plan

## Current truth from files

The original issues are not yet fully fixed.

- Mobile CSS still lacks universal `min-width: 0`, `overflow-wrap: anywhere`, and mesh/status row collapse rules.
- Tunnel API key vault still saves raw keys locally only and renders the raw key inside `<code>`.
- Pasted key save still gives weak feedback.
- Prompt page still only renders/copies and does not persist project path / mode / custom prompt across refresh.
- AI provider key panel already refreshes council and shows masked provider status, but the save button needs empty-key guard and visible confirmation.

## Required fix

1. Rewrite responsive CSS with explicit overflow prevention for mesh cards, notices, labels, code, output, tables, status chips, and buttons.
2. Rewrite tunnel API-key UI to mask saved keys, show saved/active feedback, persist locally across refresh, and never display raw key except copy action.
3. Rewrite prompt page to persist prompt settings in IndexedDB/localStorage and restore after refresh.
4. Harden AI provider key saving UX with empty-key guard and visible success/error feedback.
5. Run JS syntax checks and static verification for the exact strings/rules.
6. Run live `aiAgentList` to verify MiniMax key still appears masked from account/session after refresh path.

## Awtsmoos note

No partial patches. Each changed file is rewritten as a complete vessel.
