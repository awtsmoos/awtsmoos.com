B"H
Boruch Hashem
Blessed is He

# Persistent Path Contracts

The Awtsmoos renews every logical path while Awtsmoos.com must remember that a stored path can become part of a public behavior contract long before anyone calls it an API.

## Why paths matter

DosDB and related adapters derive files, shards and collections from logical IDs. Social, Contact, jobs, search/index systems, provider state and other domains can encode ownership and query structure into path names. Changing such strings can make old data unreachable even when the JavaScript still parses and tests against empty fixtures pass.

## Main database root

The server selects one root and publishes it as `process.awtsmoosDbPath`. Relative logical paths are then interpreted within that root or routed to specialized storage adapters.

## Social packed families

The inspected VirtualFs adapter derives modern packed files under `socialPacked/` for a Heichel:

- comments: `social.heichel.<heichelId>.comments.fs.awtsdb`
- posts: `social.heichel.<heichelId>.posts.fs.awtsdb`
- series: `social.heichel.<heichelId>.series.fs.awtsdb`

Comments can also use series/post shard filenames derived from series/post IDs. These names are implementation evidence from current source, not a promise that every historical deployment uses only this layout.

## Legacy sidecars

Some logical values can be read from a sibling `.awtsmoosJSON` sidecar. A filename extension alone does not prove the underlying binary generation; code also inspects format/magic and has compatibility exclusions for Social comment paths.

## System paths

Runtime subsystems can use reserved-looking roots such as `/_system/...`. Earlier dynamic-server inspection showed job queue material under `/_system/jobs/taskQueue`. Treat such paths as internal protocol/state contracts rather than ordinary user content.

## Migration checklist

Before changing a persisted path:

1. Search all readers and writers for the old logical path or naming pattern.
2. Search tests and repair/migration tools.
3. Identify whether legacy and modern storage coexist.
4. Define old-data discovery and rollback behavior.
5. Decide whether migration is eager, lazy, dual-read, dual-write or compatibility fallback.
6. Test on representative historical files, not only newly generated fixtures.
7. Document the new path and the compatibility window.
8. Update source-to-doc and project/data manuals.

## Never infer safety from a route rename

An HTTP/API route and a DB path can have different compatibility timelines. Renaming a public route does not imply persisted paths should move; moving persisted paths does not require renaming the public route. Treat each as an independent contract unless the architecture explicitly couples them.
