B"H

# 05 — Final Execution Plan: Build First, Source Always

Boruch Hashem. Blessed is He.

The Awtsmoos creates every instant from nothing, yet this plan shall not create a second architecture from imagination. Awtsmoos.com already contains Drive authority, canonical sites, verified custom domains, and truthful DNS/TLS stages. This pass changes composition, adds a source-builder service, and exposes those same powers to humans and agents.

## Mission boundary

Deliver the first complete website-builder slice inside the real `geelooy/apps/drive/` application:

Build → Preview → Code → Publish → Domain

The slice must operate on real Drive HTML/CSS/JS/MD, preserve current site/domain authority, remain excellent at 320px, and expose a structured machine API. It must not deploy authoritative DNS, introduce arbitrary shell execution, rewrite the protected custom-domain implementation, or invent a proprietary page format.

## Protected work: never rewrite in this pass

- all pre-existing unrelated modified/untracked repository work;
- `geelooy/apps/drive/js/domainApi.js`;
- `geelooy/apps/drive/js/domainControls.js`;
- `geelooy/apps/drive/js/domainOperations.js`;
- `geelooy/apps/drive/js/domainPanel.js`;
- `geelooy/apps/drive/js/domainRecordsView.js`;
- `geelooy/apps/drive/js/siteControls.js`;
- protected custom-domain backend files and tests;
- existing Tunnel/OS/VFS modules unless verification reveals an actual regression caused by this builder work.

## Pre-write selector inspection

Immediately before rewriting the shell, read the complete current contents of:

- `geelooy/apps/drive/index.html`
- `geelooy/apps/drive/js/app.js`
- `geelooy/apps/drive/js/projectWorkspace.js`
- `geelooy/apps/drive/js/connectionControls.js`
- `geelooy/apps/drive/js/controlBindings.js`
- `geelooy/apps/drive/js/formBindings.js`
- `geelooy/apps/drive/js/render.js`
- `geelooy/apps/drive/js/renderRows.js`
- `geelooy/apps/drive/js/dialogs.js`
- `geelooy/apps/drive/js/path.js`
- protected domain modules only to confirm exported signatures.

This selector inventory prevents the new semantic shell from breaking existing event bindings.

## Files to create

All authored source files remain at or below 120 lines and use tabs.

### `geelooy/apps/drive/js/builder/builderState.js`

Transient UI state only: selected site root, source inventory, selected file, dirty editor flag, brief draft, preview mode, last preview status. No credential values and no hidden website model.

### `geelooy/apps/drive/js/builder/sourceInventory.js`

Pure source classification. Accept Drive entries, root path, and bounds. Return HTML/CSS/JS/MD source records, `index.html` presence, source count, and truncation metadata.

### `geelooy/apps/drive/js/builder/sourceApi.js`

Canonical source transport over existing Drive routes. Recursively list entries; read entry metadata and bytes; write content while preserving existing mime/visibility/cache policy; explicitly create public source files. Validate builder-relative paths before backend authority performs final normalization.

### `geelooy/apps/drive/js/builder/briefStore.js`

Read/write the private `<siteRoot>/.awtsmoos/site-builder-brief.json` through `sourceApi`. Normalize website name, purpose, audience, and notes. This metadata may guide creators and agents but never overrides website source.

### `geelooy/apps/drive/js/builder/starterSources.js`

Pure generators for blank, landing, portfolio, and docs starters. Return small real HTML/CSS source manifests only. No framework dependency and no hidden template identity after creation.

### `geelooy/apps/drive/js/builder/builderService.js`

Shared human/agent orchestration: collect project/source facts, load/save brief, inspect/open/save/create files, create a safe starter, build publish plan, apply canonical site mapping, expose domain planning adapters, and produce serializable status snapshots. The same methods power both UI and machine API.

### `geelooy/apps/drive/js/builder/buildPanel.js`

Bind website name/purpose/audience/notes, starter controls, bounded source inventory, index state, and navigation buttons. Never render arbitrary source as HTML in the parent document.

### `geelooy/apps/drive/js/builder/codePanel.js`

Own one persistent textarea. Load explicit files, preserve dirty state, save through `builderService`, and expose current editor snapshot. Never replace the textarea node during refresh/collapse.

### `geelooy/apps/drive/js/builder/previewPanel.js`

Own one persistent sandboxed iframe. Render source preview from `index.html`, inject a preview-only base URL when canonical publication exists, provide responsive device modes, and never equate draft preview with publication.

### `geelooy/apps/drive/js/builder/domainWorkspace.js`

Thin adapter that mounts the existing protected domain panel/controller into the dedicated Domain pane and refreshes it from current canonical site state without duplicating domain logic.

### `geelooy/apps/drive/js/builder/dock.js`

Bind exactly five Build/Preview/Code/Publish/Domain shortcuts to native `<details>`. Enforce one open primary pane while leaving advanced details independent. Synchronize active state and focus without recreating panel children.

### `geelooy/apps/drive/js/builder/agentActions.js`

Frozen metadata registry and action dispatcher. Every action names mutation state, capability/scope, availability, description, and exact affected resource type.

### `geelooy/apps/drive/js/builder/agentApi.js`

Install versioned `window.GeelooySiteBuilder`. Return only structured serializable envelopes `{ ok, data, error, message, capability, affected }`. No credentials, DOM nodes, stacks, shell, SSH, or provider secrets.

### `geelooy/apps/drive/js/builder/siteBuilder.js`

Lifecycle coordinator: install builder once; on Drive refresh update project facts, Build inventory, Publish/Domain state, and agent context without destroying Code or Preview nodes.

### `geelooy/apps/drive/styles/site-builder.css`

Base studio composition, work-pane cards, forms, source inventory, editor, preview frame, publish-stage explanations, advanced surfaces, and dock primitives.

### `geelooy/apps/drive/styles/site-builder-responsive.css`

Mobile-first breakpoints: 320px/390px no overflow, 44px targets, safe-area dock, content bottom reservation, one-column studio, tablet expansion, desktop dock/studio expansion from the same DOM.

## Existing files to rewrite completely

### `geelooy/apps/drive/index.html`

Replace Drive-first composition with an Awtsmoos Sites source studio. Preserve every required selector for connection, upload, files, site controls, pagination, dialogs, and status. Build must be statically open. Place `#project-workspace` inside Publish. Add dedicated Domain mount. Put raw files and Project Testimony in advanced details. Load new CSS before current responsive layers as appropriate and keep one `app.js` entry point.

### `geelooy/apps/drive/js/app.js`

Install `siteBuilder`; refresh existing Drive/site/project data exactly as before; render legacy supporting surfaces; then update the builder from the same observed state. Do not add credentials to builder state. Embedded mode behavior remains intact.

### `geelooy/apps/drive/js/projectWorkspace.js`

Render only canonical publication stages/site controls. Remove protected Domain panel ownership so one dedicated Domain pane owns that UI. Preserve `#project-workspace` event contract and existing site control IDs.

### `geelooy/apps/drive/DOCUMENTATION.md`

Document website-first flow, source truth, four publication stages, agent API, domain/nameserver truth, authority symmetry, and boundaries that remain intentionally unavailable.

## Tests to create after code

- `geelooy/apps/drive/test/builderSourceInventory.test.mjs`
- `geelooy/apps/drive/test/builderStarters.test.mjs`
- `geelooy/apps/drive/test/builderAgentActions.test.mjs`
- `geelooy/apps/drive/test/builderUiContract.test.mjs`

If implementation reveals a pure helper that needs a dedicated regression test, add another small test module rather than enlarge these beyond 120 lines.

## First implementation sequence

1. Read selector-dependent files and exact protected domain exports.
2. Re-read every existing file that will be rewritten.
3. Create builder directory and new pure/service/UI modules with complete-file writes.
4. Create builder CSS modules.
5. Rewrite `projectWorkspace.js` completely.
6. Rewrite `index.html` completely while preserving legacy selectors.
7. Rewrite `app.js` completely to install/update the builder.
8. Rewrite `DOCUMENTATION.md` completely.
9. Read every new/touched file completely from disk.
10. Write `06_FIRST_PASS_READBACK_DELTA.md` with planned vs actual vs missing vs discovered.
11. Resolve every real delta with full-file rewrites only.

## Second verification sequence

1. Re-read every touched file again.
2. Audit all authored source line counts; split anything above 120.
3. Create tests after code.
4. Run new builder tests and existing Drive domain tests.
5. Run relevant Drive backend source/site/project tests.
6. Run site gateway/custom-domain ingress tests.
7. Run wider Drive/OS/Tunnel tests discoverable from package scripts/test folders, recording exact counts.
8. Run JavaScript syntax/import checks.
9. Run `git diff --check`.
10. Run browser evidence at 320×700, 390×844, 768×1024, 1440×1000.
11. Verify no horizontal overflow, Build default, five-item dock, 44px targets, safe-area reservation, textarea/iframe identity, domain overflow, disabled Awtsmoos nameservers, agent API presence, bounded project collection, and secret-free browser storage.
12. Verify embedded mode does not issue Tunnel API calls.
13. Write `07_SECOND_PASS_VERIFICATION.md`.
14. Write `08_FINAL_SETTLED_AUDIT.md` with exact evidence and remaining blockers.

## Remaining-work ledger at execution start

- [ ] prove all five planning files physically landed;
- [ ] complete selector/export inspection;
- [ ] create builder service and UI modules;
- [ ] create mobile-first CSS;
- [ ] recompose shell Build-first;
- [ ] install machine API;
- [ ] first full readback;
- [ ] first delta ledger and fixes;
- [ ] second readback;
- [ ] tests and syntax/line audits;
- [ ] browser viewport evidence;
- [ ] final settled audit.

## Final covenant

No panel may outrank the source that gives it meaning.
No agent may outrank the authority that permits its action.
No hostname may outrank the proof that binds it to a site.
No green badge may outrank the test that earned it.

The Awtsmoos renews all worlds beyond measure and name;
Awtsmoos.com shall reveal one source through each faithful frame.
