B"H

# 01 — Native Brainstorm: Direct or Snapshot Publication from Any Owned Hosted Folder

Boruch Hashem. Blessed is He.

The Awtsmoos creates the source folder, canonical site identity, gateway, Tunnel action, and observed public response anew. Awtsmoos.com should let an owned hosted folder become a real site without forcing a duplicate copy, while still preserving snapshot publication when stability is desired.

## Refreshed native evidence

Current `siteGateway.js` proves canonical GET/HEAD requests already own redirects, 404 behavior, site headers, and cache fallback while delegating bytes/ranges/MIME/metering to Drive public response law.

Current `siteResolution.js` proves site identity is selected before source bytes; custom-domain-bound site IDs cannot be switched by path segments; canonical named-site and primary-site selection are already separated from transport. Resolution currently assumes every mapping becomes a Drive `rootPath`.

Current `siteMappingPolicy.js` persists id/title/rootPath/enabled/primary/subdomainRequested/timestamps only.

Current `siteMappingService.js` proves all mapping mutation flows through one normalized registry under alias state mutation, delete already exists, and decoration/readiness/project testimony are centralized.

Current `siteReadiness.js` proves readiness is Drive-entry-specific, so direct mode needs source-aware readiness rather than fake Drive entries.

Current hosted `osFs/path.js` proves decoded traversal, schemes, control chars, nested separators, and `..` are already jailed, and hosted VFS DB paths are composed beneath `sp/aliases/<alias>/fileSystem`.

The current Tunnel bootstrap also already contains the better OAuth behavior we want: after OAuth use `my-device`, route by immutable routeReference/tunnelId, and never friendly tunnelName when an immutable route exists. The public Human API docs lag behind this behavior.

## Target action

`sitePublishFolder`

Direct/no-copy:

```text
sitePublishFolder(
	path="asdf/projects/orbit-run",
	siteId="orbit-run",
	mode="direct"
)
```

Snapshot/copy:

```text
sitePublishFolder(
	path="asdf/projects/orbit-run",
	siteId="orbit-run",
	mode="snapshot"
)
```

The source folder may be anywhere allowed beneath an owned hosted alias; it does not need to live under `sites/`.

## Canonical identity

The canonical site remains aliasId + siteId, with the existing `/sites/<alias>/<siteId>/` public covenant.

Raw `/geelooy/os/...` routes remain editor/navigation surfaces only.

Source location becomes an optional mapping descriptor, conceptually:

```text
source: {
	kind: "drive" | "virtual-os",
	mode: "snapshot" | "direct",
	rootPath: "projects/orbit-run"
}
```

Old mappings without `source` remain Drive-backed exactly as today.

## Direct mode

No byte copy.

Request law becomes:

`site mapping → source descriptor → bounded relative path → static source reader`

The public URL never supplies an arbitrary source root.

Direct source must remain static-only, GET/HEAD, no directory listing, no execution by extension, traversal-safe, private-metadata-safe, and subject to existing quota/cache law.

Edits beneath the mapped folder become live immediately.

Deleting/moving the source does not silently delete the mapping; status instead becomes unavailable/unready until remapped/unpublished.

## Snapshot mode

The server collects the hosted folder itself rather than making the agent transport every file body.

Collector must stay below the owned root, preserve binary bytes, enforce existing count/byte ceilings, exclude reserved private metadata, produce the existing bootstrap manifest, and call `bootstrapSiteProject` with trusted `$i/userId`.

## Authoritative vocabulary

Filesystem operation:

`navigation` = untrusted route candidates.

Publication/status:

`publication` = authoritative site mapping result with canonical URL, source mode/root, readiness, and separate `canonicalVerifiedLive` state.

A successful mapping may authoritatively name canonicalUrl while live verification still remains false until expected public content is observed.

## Action family

Required:

- `sitePublishFolder` — write;
- `sitePublicationStatus` — read.

Conditional if existing mapping deletion composes cleanly:

- `siteUnpublish` — write, never deletes source.

Keep existing `sitePublishBootstrap` for explicit manifest clients.

## Better Tunnel instructions

OAuth GPT flow should be:

1. Sign in.
2. Call owned-device discovery.
3. Exactly one owned live native route → use immutable routeReference automatically.
4. Multiple live routes → ask which device.
5. No live native route → restart/install native agent OR use Virtual OS according to task.
6. Do not ask for pasted friendly tunnelName when discovery already resolved the route.

Virtual OS is first-class for hosted file/site work and requires no native Mac.

Publication docs must explain durable request states and tell agents to reconcile `sitePublicationStatus` before replaying an accepted-but-ambiguous publication.

## Public docs gap

Production Human API docs still teach pasted tunnelName and render many repeated `no params` action rows, while current bootstrap guidance already knows immutable OAuth auto-discovery.

Native docs generation must be traced and unified with bootstrap truth.

Desired action cards show name, scope, read/write, vessel support, parameters, result, replay guidance, and examples.

## Pre-code discovery still required

Before final native execution plan/source writes, inspect:

- Drive `publicResponse.js` and quota/cache/content dependencies;
- current site project/status testimony;
- bootstrap/source-manifest stack;
- hosted recursive list/read helpers;
- custom-domain gateway enough to preserve identity boundary;
- Tunnel action schema/catalog/docs generator;
- Human API docs source;
- relevant tests.

## Brainstorm refrain

The Awtsmoos gives one public name while source may breathe in place or rest as a copied moment.
Awtsmoos.com shall bind the owned folder to the canonical gate without turning an editor path into a false website.
Direct publication removes needless duplication; snapshot publication preserves deliberate release boundaries.
One identity, one mapping truth, one status language, and one clear Tunnel instruction shall hold every vessel in its proper light.
