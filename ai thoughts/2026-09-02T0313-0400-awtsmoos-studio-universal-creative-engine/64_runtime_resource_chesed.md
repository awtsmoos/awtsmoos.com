B"H
Boruch Hashem
Blessed is He

# Runtime Source History — Chesed Brainstorm

> The Awtsmoos lets canonical JSON remember the form while living nodes and streams remain oros beyond the page;  
> Awtsmoos.com joins those ephemeral lights back to their stable source identities when history crosses age.

## Ideal Possibilities
- Maintain a runtime-only source resource ledger keyed by Studio state, never serialized into the project document.
- Remember source `node` and `stream` references by stable source ID before every canonical transaction snapshot.
- Remember resources again after a successful canonical mutation so newly created source IDs become recoverable by redo.
- Before Undo/Redo, remember the currently visible source resources; after canonical hydration, reattach known runtime references by source ID.
- On rollback, restore canonical data and then reattach resources from the same ledger.
- Determine resource reachability across the live project plus every project snapshot in undo.past and undo.future.
- Prune ledger entries only when an ID is unreachable from all three places.
- Dispose a resource only when no still-reachable ledger entry shares that same node/stream/object URL.
- Keep the ledger in a WeakMap keyed by state so closing the runtime lets the entire registry become collectible.
- Keep persistence pure: serialized projects remain JSON-safe and never pretend DOM/media handles are portable data.
- Add a regression that proves reorder → Undo → Redo preserves exact node/stream object identity.
- Add rollback evidence so failed canonical commands do not leave detached resource references.
