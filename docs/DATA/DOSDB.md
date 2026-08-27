B"H
Boruch Hashem
Blessed is He

# DosDB Architecture

The Awtsmoos renews old and new vessels together; Awtsmoos.com currently uses DosDB as a compatibility/routing layer rather than one simple storage format.

## Core role

`ayzarim/DosDB/index.js` constructs `DosDB`, binds method bags for writes, reads, paths, arrays, directories, objects and Firebase-like operations, then installs `AwtsmoosDbFsRouter` to decide whether a logical operation should use modern routed storage or the legacy implementation.

## Read behavior

The inspected source keeps a process-level final logical read cache. Repeated reads of the same database root, operation, logical ID and options can reuse the same promise. Failed cached reads remove themselves from the cache. Mutations clear the final read cache.

## Routed modern storage and legacy fallback

For operations such as `get`, `read`, `write`, `delete`, `rename`, key access and object/array synchronization, the wrapper can ask `AwtsmoosDbFsRouter` first and fall back to bound legacy methods when the routed layer has no applicable result.

A compatibility check can compare routed and legacy collections. The source deliberately avoids assuming that every `.fs.awtsdb`-named file is a modern VirtualFs database.

## AwtsmoosBinaryJSON sidecars

For some logical arrays, DosDB checks a sibling `.awtsmoosJSON` path and reads it with AwtsmoosBinaryJSON when the file carries a recognized binary-object format. Social comment paths have special exclusions so their newer routing semantics are not overwritten by a generic sidecar shortcut.

## Runtime read guard

`runtimeReadGuard.js` wraps `parseBinaryData` so a null/undefined parser result becomes `{}` for legacy callers that expect an object. The source explicitly states that this guard changes no database bytes and does not swallow real errors.

## Migration-sensitive behavior

The following are persistence contracts:

- legacy method fallback;
- modern routed-storage eligibility;
- file magic detection;
- `.awtsmoosJSON` sidecar interpretation;
- Social packed family/shard paths;
- cache invalidation on mutation;
- read-only/shared handle behavior;
- serialization format selection.

Change them only with compatibility tests and explicit migration documentation.

## Source entry points

- `ayzarim/DosDB/index.js` — main compatibility wrapper.
- `awtsmoosDbFsAdapter.js` — modern VirtualFs/legacy-file routing.
- `awtsmoosDbBridge.js` — lazy parallel AwtsmoosDB.
- `runtimeReadGuard.js` — null-safe runtime reader contract.
- `methods/` — legacy logical operation implementations.
- `awtsmoosBinary/` — binary storage/parsing systems.
