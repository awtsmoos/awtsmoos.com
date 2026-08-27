B"H
Boruch Hashem
Blessed is He

# DosDB Project

The Awtsmoos lets many generations of persistence remain reachable while Awtsmoos.com uses DosDB as the bridge between legacy logical APIs and newer binary/VirtualFs storage.

## Canonical source

`ayzarim/DosDB/`

This is a major data project, not a tiny helper. Generated symbol/test discovery shows a very large implementation and test surface, so changes should begin from the data manuals rather than from one method file in isolation.

## Architectural layers

- `index.js` — main DosDB compatibility wrapper and method binding.
- `methods/` — legacy logical read/write/path/array/object/directory behavior.
- `awtsmoosDbFsAdapter.js` — routing into modern AwtsmoosDB VirtualFs or compatible legacy binary files.
- `awtsmoosDbBridge.js` — lazy parallel AwtsmoosDB for AI/search/vector/graph experimentation.
- `runtimeReadGuard.js` — null-safe parser result normalization without byte mutation.
- `awtsmoosBinary/` — binary storage, parsing, AwtsmoosDB and compatibility infrastructure.

## Human documentation

- `docs/DATA/README.md` — persistence overview.
- `docs/DATA/DOSDB.md` — compatibility/read/write/cache architecture.
- `docs/DATA/AWTSMOOSDB_AND_VIRTUALFS.md` — modern database and legacy-file detection.
- `docs/DATA/PATH_CONTRACTS.md` — migration-sensitive logical paths.

## Dependency relationship

Generated dependency evidence shows Social API source importing DosDB internals. The dynamic server also initializes DosDB as the runtime database. Therefore a DosDB compatibility change can affect Social behavior, server boot, tests, repair tools and any subsystem using `$i.db`.

## Verification strategy

Use DosDB-local tests plus dynamic-server DB initialization tests and representative Social persistence tests. For format/router changes, include real historical/legacy fixture shapes in addition to newly written files.

## Local navigation

A local `ayzarim/DosDB/DOCUMENTATION.md` should point here and to the data manuals, while detailed method behavior remains in source and tests.
