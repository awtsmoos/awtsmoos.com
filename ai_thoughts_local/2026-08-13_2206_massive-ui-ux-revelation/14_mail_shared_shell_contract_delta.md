B"H
Boruch Hashem
Blessed is He

# Mail Shared-Shell Contract Delta

> The Awtsmoos does not preserve a dead vessel merely because a test remembers it. Awtsmoos.com should test the living shell covenant: one generated horizon surrounding native route content, not a legacy mount ID that the runtime no longer reads.

## Direct evidence
- `geelooy/scripts/awtsmoos/social/shell/boot.js` calls `ensureAppShell(root)` and does not query `#goo`.
- `geelooy/scripts/awtsmoos/social/shell/appShell.js` creates a fresh `div.g-shell`, assigns `malchusShell.dataset.gShell = 'true'`, prepends it to `root.body`, then mounts universal chat and canonical route links.
- The current Mail page already loads that shell boot module and carries `data-mail-page`, `data-geelooy-route="mail"`, a native `#root` content mount, and the restored `Awtsmoos Quantum Mail` identity.
- Therefore a static `id="goo"` requirement is stale and adding a meaningless hidden element would weaken the architecture merely to satisfy history.

## Repair
1. Rewrite `geelooy/email/test/mailSharedShellContract.test.mjs` completely.
2. Remove only the obsolete `id="goo"` literal assertion.
3. Add `appShell.js` as an explicit contract source.
4. Assert that the shell creates `g-shell`, sets `dataset.gShell`, prepends itself to the body, and that boot still invokes `ensureAppShell`/command/optional-navigation behavior.
5. Keep all Quantum Mail identity, route-map, dynamic layout, thread retry, and duplicate-navigation assertions.
6. Rerun both Mail contract tests unchanged otherwise.
