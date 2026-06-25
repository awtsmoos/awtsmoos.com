B"H

# After UI and tests

Implemented beyond the first backend pass:

- Added `remoteDesktop` to the Tunnel Control dashboard as a core automation card.
- Added `js/features/remoteDesktopPanel.js`, a visible consent-first pane with buttons for policy, create request, grant consent, mock offer, test input event, audit, and revoke.
- Rewrote `js/shell/domCollect.js` into a smaller pane collector that supports born panels (`mesh`, `remoteDesktop`) and still adopts legacy controls.
- Extended `js/api/tunnel.js` so remoteDesktop fields reach the tunnel action surface and run without requiring a separate active API key when OAuth/session is already present.
- Added `css/future/views/remote-desktop.css` and imported it from the future CSS index.

Verification completed:
- `node --check` passed for the new panel, rewritten pane collector, and rewritten page specs.
- `remoteDesktopActions.test.cjs` passed.
- `buildActions` reports 12 `remoteDesktop*` actions.
- Most touched code files are under 120 lines after the split.

Important boundary:
- The running installed tunnel agent may need reinstall/restart to load the new source files into `~/.awtsmoos-tunnel`. The codebase and manifest are ready.

