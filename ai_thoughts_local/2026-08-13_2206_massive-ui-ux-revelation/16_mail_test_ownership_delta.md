B"H
Boruch Hashem
Blessed is He

# Mail Test Ownership Delta

> The Awtsmoos does not confuse a responsibility with the file that used to carry it. Awtsmoos.com now has a cleaner sidebar split, so the contract must test behavior at its real owner.

## Evidence
- Fresh detached Mail suite: `mailSharedShellContract.test.mjs` passes.
- `mailMobileShellContract.test.mjs` now fails only at `sidebar missing mailSearchInput`.
- The current UX pass deliberately moved search/compose rendering into `geelooy/email/ui/sidebarControls.js`, while `sidebar.js` remains the composition root for folders/thread list/controls.
- `sidebarControls.js` physically contains `mailSearchInput`, `setMailSearch`, compose button, and search-clear behavior.

## Repair
Rewrite the mobile contract completely so folder-view tokens remain asserted against `sidebar.js`, while search/compose tokens are asserted against `sidebarControls.js`. Preserve every mobile viewport, single-global-dock, folder, store, and split-module assertion unchanged.
