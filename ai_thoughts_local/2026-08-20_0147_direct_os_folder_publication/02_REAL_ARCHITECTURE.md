B"H

# 02 — Native Architecture: One Site Identity, Two Source Adapters

Boruch Hashem. Blessed is He.

The Awtsmoos creates site identity before source transport. Native code already separates these concerns enough that direct hosted-folder publication can extend the system without weakening canonical or custom-domain authority.

## Proven current architecture

`siteGateway.js` owns GET/HEAD, canonical request normalization, site selection, slash redirects, fallback/branding, and delegates static transport to Drive public-response law.

`siteResolution.js` selects bound, named, or primary site identity first, then currently assumes every mapping becomes a Drive `rootPath`.

`siteMappingPolicy.js` currently persists id/title/rootPath/enabled/primary/subdomainRequested/timestamps only.

`siteMappingService.js` owns normalized registry mutation, primary selection, deletion, readiness, and project decoration.

`siteReadiness.js` is Drive-entry/public-index based, so direct mode needs source-aware readiness rather than fake Drive entries.

`osFs/path.js` provides the existing hosted VFS jail and DB composition under `sp/aliases/<alias>/fileSystem`.

## Backward-compatible mapping source

Add optional normalized source metadata conceptually:

```text
source: {
	kind: "drive" | "virtual-os",
	mode: "snapshot" | "direct",
	rootPath: "projects/orbit-run"
}
```

Compatibility:
- no `source` means current Drive behavior;
- direct mappings explicitly use hosted VFS;
- old mappings are never silently reinterpreted.

Exact rootPath duplication must be settled after state/config serialization is reread so only one effective source root exists.

## Direct public source adapter

Do not call authenticated osFs actions from public HTTP.

Create a narrow public adapter whose authority comes from the already-resolved site mapping:

`site identity → stored source descriptor → fixed alias/root → safe relative path → static byte read`

The URL never chooses an arbitrary VFS root.

The adapter should reuse the VFS path jail where possible and expose static GET/HEAD only.

## Source-aware readiness

Preserve current Drive readiness helper.

Add source-aware composition:
- Drive → current public-index/count/bytes logic;
- direct VFS → source exists, entry exists, private-path policy allows entry, bounded metadata.

Current site decoration is synchronous while direct source inspection may require DB I/O, so call sites must be traced before changing readiness signatures.

## Response law

`publicResponse.js` and dependencies still need physical inspection.

Preferred outcome is a shared static response layer for MIME/ranges/cache/metering with Drive and Virtual-OS source adapters beneath it, rather than duplicated transport behavior.

## Snapshot mode

Server-side collector should recurse below one owned source root, preserve binary bytes, enforce existing limits/private-path rules, emit the existing bootstrap manifest, and call `bootstrapSiteProject` with trusted `$i/userId`.

No giant file-body payload needs to cross Tunnel.

## Unified folder publication

Potential service:

`publishSiteFolder({ $i, actorUserId, path, siteId, mode, ... })`

Direct:
1. authorize owned hosted source;
2. validate folder/entry/public policy;
3. upsert direct mapping;
4. return authoritative publication receipt.

Snapshot:
1. authorize source;
2. collect bounded manifest;
3. call existing bootstrap;
4. return canonical receipt with source mode/provenance.

## Tunnel actions

Required:
- `sitePublishFolder` — write;
- `sitePublicationStatus` — read.

Optional if current mapping delete composes cleanly:
- `siteUnpublish` — write, never delete source.

Keep `sitePublishBootstrap` for explicit manifest clients.

Trusted dispatcher remains the authority source for `$i` and authenticated userId.

## Status vocabulary

Use one `publication` shape for publish result and status:
- authoritative;
- mapped;
- aliasId/siteId;
- canonicalPath/canonicalUrl;
- source kind/mode/root;
- sourceAvailable;
- entryReady;
- canonicalVerifiedLive separately;
- safe domain summary if current status already supports it.

Filesystem `navigation` remains untrusted.

## Tunnel docs

Control bootstrap already has correct OAuth auto-discovery/immutable-route guidance; Human API docs lag behind.

Docs should derive setup language from one canonical model where possible and render action name, scope, read/write, vessel support, payload/result schemas, replay guidance, and direct/snapshot examples.

## Native discovery still required before product writes

- `publicResponse.js` + cache/quota/content dependencies;
- Drive state/config serialization;
- site project/status testimony;
- bootstrap/source manifest/content;
- hosted recursive list/read;
- custom-domain gateway;
- Tunnel action schema/catalog/docs generation;
- relevant tests.

## Architecture refrain

The Awtsmoos gives the site one Malchus while source may dwell in Drive or hosted VFS.
Awtsmoos.com shall resolve identity first, source second, and bytes only through the proper bounded vessel.
Direct source receives the Gevurah of path/privacy/quota law; snapshot preserves a chosen moment.
One canonical name remains, and no raw filesystem road may steal its crown.
