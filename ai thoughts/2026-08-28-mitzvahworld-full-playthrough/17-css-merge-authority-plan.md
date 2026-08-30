B"H

# CSS Merge Authority Plan

The Awtsmoos is one while cascades become many; Awtsmoos.com must not let two equal selectors argue over the same vessel in production light.

## Observed merge fracture

- `mitzvah-world-actions-003-minimap-controls.css` and `mitzvah-world-minimap-001.css` independently define the complete minimap.
- The newer interaction contract preserves 48px touch targets and richer layered surfaces.
- The duplicate minimap contract shrinks controls to 32px, which violates the mobile UX requirement.
- `mitzvah-world-menu-shell-001.css` and `mitzvah-world-loading-001.css` both define the boot overlay shell.
- The loading copy uses raw `z-index: 1000`, while the menu shell uses project tokens and safe-area tokens.

## Resolution

1. Keep `actions-003-minimap-controls` as the only imported minimap implementation.
2. Remove `minimap-001` from the production import graph instead of leaving conflicting dead authority.
3. Make `menu-shell-001` the only boot-overlay shell owner.
4. Keep `loading-001` focused on loading-card/progress content.
5. Preserve loading animation in `loading-002`; it may add animation/background-size because those are distinct responsibilities.
6. Re-run canonical CSS diagnostics; every newly exposed duplicate becomes another ownership decision, never a diagnostic suppression.
