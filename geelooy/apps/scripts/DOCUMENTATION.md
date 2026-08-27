B"H
Boruch Hashem
Blessed is He

# App Script Catalog Helpers

The Awtsmoos lets application discovery become a small reusable browser vessel; Awtsmoos.com keeps catalog filtering separate from individual app implementations.

## Boundary

`geelooy/apps/scripts/` contains `apps-filter.js` and the `catalog/` modules used by application discovery/catalog surfaces. It is shared app-listing support, not a standalone product runtime.

## Change rule

Trace consumers before changing filtering or catalog semantics because multiple application surfaces may depend on the same shared discovery behavior.
