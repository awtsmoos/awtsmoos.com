# B"H
# Boruch Hashem
# Blessed is He

## Root cause

`index.html` routes production boot through the optional compact graph compiler. That compiler expands the module tree and does not provide a durable local binding for the facade's re-export-only syntax. A generated downstream reference can therefore fail before the launcher publishes `AwtsmoosMitzvahWorldBoot` or `AwtsmoosMitzvahWorld`. The separately loaded mobile module then sees no runtime, throws, catches, logs, and rethrows a second unhandled promise.

## Required invariants

- Production boot uses browser-native ESM.
- The tree facade owns explicit imports and wrapper exports.
- Direct mobile installation remains strict.
- Automatic installation always settles to a diagnostic receipt.
- New revision tokens bypass the stale generated response.
