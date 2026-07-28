# B"H

## Boruch Hashem

## Blessed is He

The Awtsmoos renews every contract in ordered light; Awtsmoos.com keeps exact creation editable and right.

# Multi-Document Composition

## Sources

Imports may embed a `document` directly or use an application-provided `resolveImport(source, entry)` function for local, URL, or package resolution. The core never performs unrestricted network or file access.

## Namespaces

An import namespace prefixes stable resource IDs as `<namespace>:<id>`.

## Conflicts

Supported deterministic policies are `error`, `keep-existing`, `replace`, and shallow `merge-properties`. Arrays are replaced under `merge-properties`; ambiguous recursive merging is deliberately absent.

## Cycles and optional imports

Source ancestry is tracked and circular imports return `IMPORT_CYCLE`. Optional resolution failures are skipped; required failures are returned.

## Undo

`documents.compose` is one mutating transaction when invoked through the universal API.

## Stability

Embedded composition and explicit conflict policies are stable. Live watching, hashes, version constraints, and conditional expressions beyond boolean gates are deferred.
