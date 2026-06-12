B"H

# Execution Plan: Do The Module Split

I will implement the split from plan 20 now.

Rules for this pass:

- Every modified file will be rewritten completely.
- Existing public import paths remain stable through compatibility re-export files.
- New modules stay small and focused.
- No behavior changes are intended.
- Verification must include syntax and import resolution.

Implementation order:

1. API Keys
   - Create `js/features/apiKeys/`.
   - Write `keyDisplay.js`, `keyFeedback.js`, `savedKeyCards.js`, `keyActions.js`, `index.js`.
   - Rewrite `js/features/apiKeys.js` as re-export.

2. Status
   - Create `js/features/status/`.
   - Write `statusText.js`, `summaryCards.js`, `liveConfig.js`, `tunnelDiscovery.js`, `index.js`.
   - Rewrite `js/features/status.js` as re-export.

3. Path Crumbs
   - Create `js/features/pathCrumbs/`.
   - Write `splitPaths.js`, `crumbDom.js`, `index.js`.
   - Rewrite `js/features/pathCrumbs.js` as re-export.

4. Control Panels
   - Create `js/ui/controlPanels/`.
   - Write `panelDetection.js`, `panelStorage.js`, `panelToolbar.js`, `panelShell.js`, `floatingMap.js`, `keyboardShortcuts.js`, `index.js`.
   - Rewrite `js/ui/controlPanels.js` as re-export.

5. Verification
   - `node --check` all new modules and wrappers.
   - Full relative import resolver.
   - DOM raw HTML scan in split module families.
   - Git diff stat.
