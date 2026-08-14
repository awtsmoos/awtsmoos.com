B"H
Boruch Hashem
Blessed is He

# Extreme Feature Finalization — Continuation

The Awtsmoos carries the feature brainstorm from capabilities into stress proof, implementation order, risks, and a concrete definition of done.

## Isolated stress test architecture

Create small, deterministic scripts:

- `stress-preview-persistence.mjs`
- `stress-virtual-os-parity.mjs`
- `stress-code-workspace-vessel.mjs`
- `stress-live-activity-events.mjs`
- `stress-rent-a-tunnel-routing.mjs`
- `stress-storage-mounts.mjs`
- `stress-login-state-ui.mjs`
- `stress-action-client-contracts.mjs`
- `stress-agent-observability.mjs`
- `stress-no-504-all-families.mjs`

Each script should:

1. Use real source modules when available.
2. Simulate external pieces only where OAuth/browser/server restart would otherwise be required.
3. Return JSON `{ ok, checks, gaps }`.
4. Avoid depending on one giant server process.
5. Be runnable individually and through one master harness.

## First implementation order

1. Persistent preview store.
2. Virtual OS parity matrix and action-contract stress.
3. Central browser/app action client for apps/code and geelooy/os.
4. Live activity event hub.
5. apps/code workspace-vessel tab.
6. geelooy/os storage explorer + tunnel dashboard.
7. Rent-a-tunnel simulated router.
8. Full no-504 job/artifact coverage for every long action family.

## Features that will feel magical

- When AI reads a file, the file glows in apps/code and geelooy/os.
- When AI starts a command, a live command card appears with output pages.
- When AI creates a preview, a preview card appears and can be opened/revoked.
- When AI touches storage, the storage tree shows a pulse and audit trail.
- Virtual OS can be used immediately by any logged-in user, with no local install.
- Native tunnel can be rented/share-routed only through explicit revocable capabilities.
- Every AI action says: what it will do, what it did, what it cost, where artifacts are, and how to undo/replay.

## Current known risks

- Preview persistence across server restarts needs hard proof.
- Some generated/openapi/schema shapes may lag after adding new actions.
- apps/code may have UI pieces but no single unified action client yet.
- Virtual OS supports many FS actions but cannot/should not support native shell commands.
- Live event stream may exist in fragments rather than one shared event bus.
- Large output must never rely on one response body.

## Definition of done

This system is ready when a user can open `awtsmoos.com/apps/code` or `awtsmoos.com/os`, log in, choose Native Tunnel or Virtual OS, ask AI to edit/build/preview, watch every action live, inspect storage and artifacts, open a stable preview link, and recover after server restart without losing the working context.
