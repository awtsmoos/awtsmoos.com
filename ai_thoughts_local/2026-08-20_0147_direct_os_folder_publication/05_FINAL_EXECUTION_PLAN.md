B"H

# 05 — Final Execution Plan: Any Hosted Folder → Canonical Site

Boruch Hashem. Blessed is He.

The Awtsmoos creates source, site identity, Tunnel authority, gateway, release, and public verification anew. The implementation must let any owned hosted `geelooy/os` folder publish as one canonical site in either live/no-copy or snapshot/copy mode.

## Contract

- `sitePublishFolder` — write; default `mode: "direct"`.
- `sitePublicationStatus` — read.
- `siteUnpublish` — write only if current mapping deletion composes cleanly; never delete source.
- Preserve `sitePublishBootstrap`.

Canonical URL belongs to aliasId + siteId, not raw source path. `/geelooy/os/...` remains editor/navigation only.

## Pre-code gate

Before runtime rewrites, read completely:

1. `publicResponse.js` and MIME/range/cache/quota/content dependencies.
2. Site config/state repository, `siteProjectStatus.js`, testimony helpers, site routes.
3. `siteProjectBootstrap.js`, `siteSourcePublisher.js`, `siteSourceManifest.js`, `siteSourceContent.js`.
4. osFs `listRead.js` plus recursive/binary helpers.
5. Custom-domain gateway/ingress/Host policy.
6. Tunnel publication modules, scope, action schema/catalog, Human API docs generator/source, setup/device docs, tests.

Then fresh `git status --short --branch`; stop/replan if a planned tracked target has unrelated dirtiness.

## Mapping and source adapters

Add optional backward-compatible source metadata:

```text
source: {
	kind: "drive" | "virtual-os",
	mode: "snapshot" | "direct",
	rootPath: "projects/orbit-run"
}
```

Missing descriptor means exact legacy Drive behavior.

Refactor site resolution only enough to separate site identity from source transport. Preserve custom-domain locking, named routes, primary fallback, redirects, enabled checks, branding, and canonical route semantics.

Direct public law:

`resolved mapping → fixed alias/root → jailed relative path → static bytes`

GET/HEAD only, no listing, no execution, private metadata denied, existing VFS jail reused, current MIME/range/cache/quota/metering preserved. Deleted source makes readiness false without deleting mapping.

## Snapshot mode

Server collects folder below one owned root, preserves binary bytes, enforces existing file/byte limits, excludes private metadata, emits current bootstrap manifest, then calls existing `bootstrapSiteProject` with trusted actor/context. Tunnel does not transport every file body.

## Publication/status service

Create a site/Drive-level `publishSiteFolder(...)` outside Tunnel dispatcher.

Direct: authorize source → validate entry/privacy → upsert direct mapping → authoritative receipt.

Snapshot: authorize source → collect manifest → bootstrap → preserve canonical receipt.

Use one bounded `publication` shape containing canonicalPath/canonicalUrl, source kind/mode/root, sourceAvailable, entryReady, and separate canonicalVerifiedLive.

## Tunnel actions and instructions

Trusted hosted dispatcher supplies `$i` and authenticated userId. Caller identity, credentials, `$i`, and services remain non-authoritative.

Scopes:
- folder publish → `tunnel.write`;
- publication status → `tunnel.read`;
- unpublish → `tunnel.write`;
- bootstrap remains write.

OAuth docs must match control bootstrap truth:

1. OAuth sign-in.
2. Auto-discover owned devices.
3. Exactly one live native route → use immutable routeReference; do not ask for pasted tunnelName.
4. Multiple live routes → ask which device.
5. None → offer native refresh/install or Virtual OS according to task.
6. Friendly tunnelName is display/manual compatibility only.

Document same installer rerun as refresh. Virtual OS needs no native install for hosted files/direct publication.

Explicit rule:

**Never derive a website URL from `/geelooy/os/...`. Call `sitePublishFolder` and use `publication.canonicalUrl`.**

Examples:

`sitePublishFolder(path="asdf/projects/orbit-run", siteId="orbit-run", mode="direct")`

`sitePublishFolder(path="asdf/projects/orbit-run", siteId="orbit-run", mode="snapshot")`

Docs must distinguish pending acceptance, accepted/running, terminal, and acceptance timeout. Resume pending non-idempotent mutations; after accepted ambiguity, query status before replay.

Fix repeated `no params` docs rendering at schema/generator source. Action cards show name, scope, read/write, vessel support, payload/result schemas, replay guidance, examples.

## Builder

After backend stabilizes, Publish UI exposes Live Folder (no copy) and Snapshot Copy, and separately shows mapped canonical URL, source readiness, and verified-live state.

## Code/test law

Whole-file rewrites only after complete reads. Tabs, readable B"H/Awtsmoos JSDoc. Every authored source/test <=120 lines. Source before tests. Full source reread before tests. Write `06_FIRST_PASS_READBACK_DELTA.md`, fix whole-file, reread, then focused + complete regressions. Finish with syntax checks, line counts, `git diff --check`, focused diff/status, and verification/audit ledgers.

## Release and production

Never release from protected dirty primary tree. Use clean isolated whole-file reconstruction, rerun tests there, guarded prepare dry-run, prepare, activation dry-run, exact-SHA activation.

After deployment, verify docs/actions/scopes, recollect Bounce source, publish its current folder direct exactly once, capture authoritative canonicalUrl, externally verify `Awtsmoos Bounce: Orbit Run`, assets, and game boot, then report live.

## Completion

`edit owned folder → sitePublishFolder(direct|snapshot) → canonicalUrl → status → external verification → live site`

No path guessing. No mandatory copy. No credential scraping. No Host-to-filesystem shortcut.

The Awtsmoos gives every owned folder a public crown without demanding a second body; Awtsmoos.com binds one lawful source to one canonical site and lets truth, not guessed paths, name what is live.
