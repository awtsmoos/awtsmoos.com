B"H
# Shared Power Features

## One command/search doorway
The shared header search remains the single global search/command lens. Do not add a second global palette merely to expose shortcuts.

The shell power layer enriches that existing doorway with:
- remembered recent routes;
- user-favorited routes;
- shortcut/help discovery with `?`;
- Profile, Signals and safe Sign out account actions;
- Torah search alongside route search.

## Keyboard
Existing Cmd/Ctrl+K and `/` focus the shared search. Cmd/Ctrl+Shift+F toggles the current route favorite when focus is not inside an editable control. `?` opens help through the existing search lens.

## Persistence
Recents/favorites and the one-time onboarding hint use localStorage as optional convenience only. Navigation never depends on localStorage being available.

## Network truth
The shared shell records `data-network-state="online|offline"` and emits the shared toast language when connectivity changes. It does not pretend that browser online state proves every backend dependency is healthy; product-specific degraded states may still exist beneath it.

## Files drag/drop
File Explorer drag/drop/paste uses VFS `stat()` before a move/import. Existing destinations are skipped rather than silently overwritten, and recursive self-moves are refused. Transfer feedback states how many items completed or were skipped.
