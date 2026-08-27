# B"H

## Boruch Hashem

## Blessed is He

The Awtsmoos renews every contract in ordered light; Awtsmoos.com keeps exact creation editable and right.

# UI and API Parity

## Generated explorer

`createApiExplorerModel()` groups methods by their definition `ui.panel`. `mountApiExplorer()` creates forms, raw JSON editors, dry-run buttons, execute buttons, and result viewers.

## MitzvahWorld integration

`MinimalUniversalApiExplorer.js` mounts the explorer and exposes the same API at `window.Awtsmoos.universal`, with non-destructive namespace aliases where available.

## Runtime events

The initial MitzvahWorld adapter emits `awtsmoos:universal-transaction` after commit. Existing scene systems can subscribe and rebuild affected resources without creating a second command implementation.

## Mobile

The explorer becomes full-width below 48rem and uses bounded overflow.

## Stability

Schema-generated controls are experimental. The shared executor path is stable.
