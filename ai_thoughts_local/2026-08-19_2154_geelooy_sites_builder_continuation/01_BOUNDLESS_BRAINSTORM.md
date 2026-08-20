B"H

# 01 — Boundless Brainstorm: Geelooy Sites as a Living Source Studio

Boruch Hashem. Blessed is He.

The Awtsmoos creates every instant anew; this ledger therefore refuses to worship a stale diagram. Awtsmoos.com should let a human move from desire to living source, from source to sight, from sight to publication, and from publication to a verified public name — while every byte remains inside the same real Drive covenant.

## North-star experience

The first visible question is not “which storage operation?” but “what website do you want to make?” The primary semantic journey is Build → Preview → Code → Publish → Domain. Files, Project Testimony, runtime, Git, Tunnel, and storage accounting remain available as deeper powers, not prerequisites for understanding the product.

A creator should be able to:

- name a website and explain its purpose, audience, and extra instructions;
- choose blank, landing, portfolio, or documentation source starters when real source generation supports them;
- inspect the exact HTML/CSS/JS/MD files that already exist;
- open a file and edit its actual Drive bytes, never an opaque proprietary page model;
- preview the current HTML draft without destroying the editor node;
- publish through the existing canonical Drive site mapping rather than calling a temporary preview “published”;
- attach a custom hostname through the existing server-side domain claim, DNS, routing, and TLS states;
- choose current DNS or custom external nameservers while seeing Awtsmoos-authoritative nameservers truthfully unavailable until infrastructure exists;
- perform the same bounded operations through a documented machine API.

## Possible product powers worth revealing

1. A Build brief stored as private project metadata, never as source that overrides HTML.
2. A bounded source inventory rooted in the selected canonical site root.
3. A source starter creator that writes real public files through normal Drive write authority.
4. A Code pane with a persistent textarea node and explicit Save action.
5. A source preview iframe with device widths for 320, 390, 768, and fluid desktop.
6. A Publish pane that reuses existing site-mapping controls and clearly names canonical publication.
7. A Domain pane that reuses the already-built domain UI and server-generated verification plans.
8. A Files jump that opens the underlying Drive workspace instead of hiding it.
9. An Advanced workspace containing usage and Project Testimony.
10. A bottom mobile dock fixed to Build / Preview / Code / Publish / Domain, with safe-area padding.
11. The same DOM on desktop, simply expanded into a studio layout.
12. A machine action registry with metadata: name, mutates, capability, availability, description, affected resource.
13. A structured result envelope `{ ok, data, error, message, capability, affected }`.
14. Nested `window.GeelooySiteBuilder` namespaces for project, files, code, preview, publish, domain, and nameservers.
15. Source reads through authorized Drive GET content responses.
16. Source writes that first inspect entry metadata and preserve visibility/cache policy/mime.
17. New-file creation that explicitly chooses public or private visibility instead of relying on accidental defaults.
18. Brief persistence inside a private `.awtsmoos/site-builder-brief.json` file under the selected site root, because hidden project intent may assist humans/agents but must never override actual website source.
19. Starter generation under `sites/<slug>/` so a new site can be created without colliding with unrelated Drive root files.
20. Canonical mapping activation after source exists, using the existing site resource contract.

## Five candidate compositions

### A — Replace Drive completely

Make the app only a website builder and remove file manager surfaces. Strong product focus, but unacceptable because it would erase existing Drive workflows and contracts.

### B — Put a builder above Drive and leave Drive unchanged

Add one first-class builder shell, then place legacy storage and infrastructure inside advanced retractable surfaces. This preserves contracts and shifts product priority without duplicating architecture. Strong candidate.

### C — Build a separate new app

Create `/apps/sites/` and leave Drive alone. Clean isolation, but it would duplicate authentication, source browsing, site publication, and domain orchestration. Too much drift for this continuation.

### D — Make Project Testimony itself the builder

Expand the existing infrastructure cockpit until it contains editing and preview. This risks turning the human website flow back into an infrastructure dashboard. Reject as primary composition.

### E — Build a visual proprietary page model

Fast for drag-and-drop, but violates the mission because hidden state could diverge from real HTML/CSS/JS. Reject.

## Chosen conceptual direction

Composition B: the real `geelooy/apps/drive/` application becomes website-builder-first while remaining Drive-powered. Build is the default open work surface. Preview and Code sit beside it. Existing site mapping becomes Publish. Existing protected domain modules become Domain. Project Testimony and raw files move into advanced retractable regions.

## Source truth and preview truth

The editor must never create a shadow document model. The text shown in Code is loaded from Drive. Saving writes Drive. Preview may display the unsaved `index.html` draft in an iframe `srcdoc`, but linked assets should resolve against the canonical site root when available; the UI must explain that distinction. Preview refresh must not imply publication.

A later richer preview may construct a complete object-URL graph of unsaved CSS/JS/assets, but that is not required to truthfully ship the first real builder composition.

## Agent contract universe

Candidate implemented actions, only where existing capabilities support them:

- `site.project.describe`
- `site.project.collect`
- `site.project.setBrief`
- `site.files.list`
- `site.files.read`
- `site.files.write`
- `site.files.create`
- `site.code.open`
- `site.code.inspect`
- `site.code.updateCurrent`
- `site.preview.open`
- `site.preview.refresh`
- `site.preview.status`
- `site.publish.plan`
- `site.publish.apply`
- `site.publish.status`
- `site.domain.plan`
- `site.domain.claim`
- `site.domain.verify`
- `site.domain.activate`
- `site.domain.remove`
- `site.domain.instructions`
- `site.nameservers.plan`
- `site.nameservers.verify`

History restore, arbitrary runtime commands, Git mutation, DNS-provider secrets, certificate private material, and shell execution should remain absent until purpose-built bounded services exist.

## Safety boundaries

- Never map a Host header to a filesystem path.
- Never store the Drive credential in localStorage or expose it in agent snapshots.
- Never call SSH from the browser.
- Never call Certbot from the browser.
- Never claim Awtsmoos authoritative nameservers are live.
- Never mutate user-protected domain files merely to make the builder composition easier.
- Never retry non-idempotent writes automatically.
- Never make preview synonymous with canonical publication.

## Verification universe

- unit tests for source inventory, action metadata, and result envelopes;
- DOM contract tests for the five dock names, Build default, details semantics, and disabled Awtsmoos nameservers;
- syntax checks for every touched/new JavaScript file;
- line-count audit ≤120 for authored source;
- `git diff --check`;
- existing Drive tests and relevant site/domain/backend tests;
- viewport evidence at 320×700, 390×844, 768×1024, 1440×1000;
- textarea identity before/after Code collapse;
- iframe identity before/after Preview collapse;
- no horizontal overflow;
- zero Tunnel API requests in embedded Drive mode;
- agent API presence and bounded project collection;
- no credential leakage into DOM/localStorage.

## Closing image

The Awtsmoos gives form without becoming trapped by form. So too should Awtsmoos.com give a creator a luminous website studio without trapping the website in a proprietary vessel. The file remains a file, the route remains a route, the domain remains a proved covenant, and each pane merely reveals the same truth from another side.
