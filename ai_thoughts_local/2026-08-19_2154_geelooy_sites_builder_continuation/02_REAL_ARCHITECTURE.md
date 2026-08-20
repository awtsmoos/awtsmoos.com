B"H

# 02 — Real Architecture: Evidence Before Composition

Boruch Hashem. Blessed is He.

The Awtsmoos renews the world every instant; therefore this architecture record names only what was physically observed in the live repository and distinguishes it from intended work.

## Observed repository reality

Repository root: `/Users/awtsmoos/work/awtsmoos.com`.

Observed branch state before product writes: `main...origin/main [ahead 1]` with substantial pre-existing modified and untracked work. The existing custom-domain frontend and several domain backend files are protected user work and will not be rewritten by this continuation.

The previously reported `geelooy/drive/` builder tree does not physically exist. The active browser Drive application is `geelooy/apps/drive/`.

The active app currently contains:

- `index.html` — Drive-first shell;
- `js/app.js` — refresh orchestration;
- `js/state.js` — transient credential/path/site state;
- `js/apiTransport.js` — canonical `/api/social` authenticated transport;
- `js/api.js` — Drive/site/project resource verbs;
- `js/projectPlatform.js` — infrastructure Project Testimony cockpit;
- `js/projectWorkspace.js` — canonical site publishing workspace;
- `js/siteControls.js` — existing site mapping interactions;
- protected domain modules under `js/domain*.js`;
- responsive CSS without a five-item builder dock.

## Observed backend source contract

`geelooy/api/social/helper/drive/routes/entryRoutes.js` proves:

- GET `/drive/:aliasId/entries` requires `drive.read` and supports path, search, recursive, limit, sort, direction and filters;
- GET `/drive/:aliasId/entry/:path*` normally returns entry metadata;
- GET with `content=true` returns private file bytes through `buildPrivatePathResponse` while still requiring `drive.read`;
- PUT with content writes through `writeDriveFile`;
- content mutation requires `drive.write`, while changing visibility/cache policy additionally requires `drive.public`;
- DELETE requires `drive.delete`.

`writeService.js` reveals an important preservation rule: a content overwrite constructs the replacement entry from supplied options. If visibility/cache metadata is omitted, the resulting defaults may differ from the old public metadata. Therefore every builder/agent overwrite must inspect metadata first and resend the existing `visibility`, `cachePolicy`, and `mime` values.

## Observed site bootstrap contract

`routes/actionRoutes.js` exposes POST `/drive/:aliasId/actions/bootstrap-site-project` and requires both `drive.write` and `drive.public`.

`siteProjectBootstrap.js` composes source publication, durable project config, canonical site mapping, Project Testimony, and a workspace receipt. `siteSourceManifest.js` bounds source publication to 64 files and 2 MiB. This proves that source-oriented site creation already belongs in Drive architecture.

The current browser transport URL-encodes request values, so complex bootstrap arrays are not yet proven usable from the browser exactly as-is. The first builder composition should therefore use the already-proven scalar entry/site resource routes for browser starter creation unless the body transport is deliberately extended and separately tested.

## Observed project-config boundary

`projectConfigPolicy.js` persists project id, name, root path, runtime preference, bindings, provider intents, timestamps, and rejects credential-looking fields. It does not persist purpose/audience/notes.

Rather than silently widening this public backend schema during a UI composition pass, builder brief metadata can live as a private real Drive file under the selected site root:

`.awtsmoos/site-builder-brief.json`

This file is project metadata, not website source. It may guide humans/agents but never overrides HTML/CSS/JS/MD. It travels through ordinary Drive read/write authority and can later be migrated to a dedicated metadata schema if needed.

## Observed canonical publication

`siteMappingService.js`, `siteMappingPolicy.js`, `siteStatusService.js`, `siteProjectStatus.js`, `siteGateway.js`, and `siteResolution.js` prove:

- named site IDs are bounded DNS-like slugs;
- each site maps to a normalized Drive root;
- public serving is rooted by the site mapping, not arbitrary caller paths;
- primary and named site URLs remain compatible with existing `/sites/:aliasId/:siteId/` behavior;
- site response transport reuses Drive public-response semantics;
- canonical publication is distinct from temporary preview semantics.

The new UI must not replace this system; Publish should be a human-facing composition over it.

## Observed custom-domain ingress

`customDomainHttpIngress.js`, `customDomainGateway.js`, `requestHostPolicy.js`, and domain backend modules prove:

internet Host → platform-host check → canonicalized hostname → verified active domain resolution → pre-bound alias/site → existing site gateway.

Unknown external hosts are closed with HTTP 421. A custom host is not allowed to select arbitrary Drive content. A path under a custom hostname cannot switch into a sibling site because site identity is already bound.

The existing protected domain frontend already provides:

- current DNS provider mode;
- custom external nameserver mode;
- disabled “Awtsmoos nameservers — not deployed” mode;
- server-side claim/verification/activation operations;
- separate ownership/delegation/routing/TLS status display.

The builder should embed/reuse these modules without rewriting them.

## Real frontend composition target

### Static HTML structure

Rewrite `geelooy/apps/drive/index.html` as one semantic DOM with:

1. compact Awtsmoos Sites header and existing connection controls;
2. primary `#site-builder` studio;
3. five native `<details>` work panes: Build, Preview, Code, Publish, Domain;
4. Build open by default;
5. existing `#project-workspace` physically nested inside Publish so `siteControls.js` keeps its public DOM contract;
6. a dedicated Domain root owned by a new builder domain adapter using protected domain modules;
7. a bottom/desktop dock with exactly Build / Preview / Code / Publish / Domain;
8. advanced `<details>` for raw Files, usage, and Project Testimony;
9. existing dialogs preserved.

### Builder modules

Create small modules under `geelooy/apps/drive/js/builder/`:

- `builderState.js` — selected pane/site/file, brief, preview state, no credentials;
- `sourceInventory.js` — filter/bound HTML/CSS/JS/MD source metadata;
- `sourceApi.js` — real recursive list/read/write helpers using canonical Drive authority;
- `briefStore.js` — private brief-file read/write and validation;
- `starterSources.js` — bounded blank/landing/portfolio/docs real-source generators;
- `builderService.js` — shared human/agent orchestration over source/site APIs;
- `buildPanel.js` — brief, starter, source inventory and navigation actions;
- `codePanel.js` — persistent textarea and explicit real-source Save;
- `previewPanel.js` — persistent iframe, device modes, source-preview labels;
- `domainWorkspace.js` — protected domain-panel adapter;
- `dock.js` — one-open-pane primary navigation, details semantics;
- `agentActions.js` — metadata registry and action execution;
- `agentApi.js` — install `window.GeelooySiteBuilder` structured machine surface;
- `siteBuilder.js` — lifecycle coordinator that updates without replacing Code/Preview nodes.

### Existing files to rewrite completely

- `geelooy/apps/drive/index.html` — product composition;
- `geelooy/apps/drive/js/app.js` — install/update builder around existing refresh;
- `geelooy/apps/drive/js/projectWorkspace.js` — keep Publish focused and move Domain ownership to the dedicated builder domain root;
- `geelooy/apps/drive/DOCUMENTATION.md` — describe builder and machine API boundaries.

`siteControls.js` should remain untouched because it is exactly 120 lines and its DOM contract can be preserved by nesting its current root inside Publish.

Protected `domain*.js` files remain untouched.

### CSS

Add:

- `styles/site-builder.css` — studio, pane, editor, preview, forms, dock primitives;
- `styles/site-builder-responsive.css` — 320-first behavior, safe-area fixed dock, tablet/desktop expansion, overflow law.

Existing oversized `components.css` remains untouched.

## Human and machine service symmetry

The UI and agent API must call the same builder service. No agent-only write path exists.

Read actions:

- project collect/describe;
- files list/read;
- code inspect/open;
- preview status/open/refresh;
- publish plan/status;
- domain plan/status/instructions where server API is read-only.

Mutating actions:

- project setBrief;
- files create/write;
- code updateCurrent;
- publish apply;
- domain claim/verify/activate/remove as defined by existing server routes.

Every machine result uses a stable envelope and metadata. No credential, API key, cookie, SSH material, registrar password, DNS-provider secret, or certificate key is returned.

## Preview stages in product language

1. **Source Preview** — local sandboxed iframe of current source draft; not a durable URL.
2. **Owned full-folder preview** — existing Tunnel capability; advanced and not invoked automatically by this Drive builder.
3. **Canonical Awtsmoos Site** — existing durable Drive site mapping.
4. **Custom Domain** — verified hostname bound to canonical site, with DNS/routing/TLS stages.

## Test architecture

New app tests should avoid requiring a browser where pure modules suffice. Use Node ESM tests for source inventory, starter output, and agent action metadata. Add an HTML/UI contract test that reads the real `index.html` and asserts semantic dock/pane contracts.

Use browser control for actual viewport evidence after source tests pass. Static serving is enough for initial shell/DOM behavior; authenticated API-dependent operations require the real dev server or a controlled fixture and must not be falsely claimed if unavailable.

## Architecture poem

From root to route, from byte to name,
The Awtsmoos breathes, yet truth stays same.
Awtsmoos.com need not invent a throne:
The Drive already knows each owned stone.
We change the doorway, not the law;
We let the maker touch the source they saw.
