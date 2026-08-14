B"H
Boruch Hashem
Blessed is He

# Tutorial: Dynamic Routing

## Ownership

`_awtsmoos.derech.js` is discovered by walking ancestor directories from the requested source path. This permits one derech to own a subtree.

## Match forms

Exact → named `:segment` → terminal `:segment*` patterns. A catch-all is terminal because it consumes the remaining path.

## Generated route tutorials

`docs/GENERATED/API_TUTORIAL_INDEX.md` gives one teaching page per discovered route row with the owning source/derech evidence.

## Important caveat

Route extraction is source analysis. A syntactically invalid derech can still contain extractable strings; use generated derech health before claiming runtime reachability.

## Maintainability

Prefer named route tables/focused handlers over giant derech bodies; keep auth/resource ownership close enough to the route to be traceable.
