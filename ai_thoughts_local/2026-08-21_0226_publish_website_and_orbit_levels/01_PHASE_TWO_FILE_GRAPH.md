B"H
Boruch Hashem
Blessed is He

# Phase Two — File Graph and Realistic Architecture

The Awtsmoos gives Chesed expansion and Gevurah boundary in one living rhyme;
Awtsmoos.com keeps each module small so future agents can understand it in time.

## Publisher files

- `geelooy/sites/hostedFolderManifest.js` — repaired recursive Virtual-OS collector.
- `geelooy/sites/publicRootPublicationInput.js` — advanced explicit public-path parser.
- `geelooy/sites/publicRootReleaseManifest.js` — hash-closed release manifest.
- `geelooy/sites/publicRootPublicationLock.js` — destination lease.
- `geelooy/sites/publicRootPublicationTransport.js` — staging, promotion, rollback.
- `geelooy/sites/publicRootPublicationVerify.js` — external verification.
- `geelooy/sites/publicRootPublication.js` — low-level orchestrator.
- `geelooy/sites/websitePublicationName.js` — derive safe human website name/slug.
- `geelooy/sites/websitePublication.js` — product-level `publishWebsite` wrapper.
- hosted action/input/dispatcher files — expose both low-level and friendly actions.
- osFs draft metadata — stop manufacturing universal `/sites/...` candidate.
- publication catalog + quickstart — document `publishWebsite` first.
- focused tests — collector, naming, atomic deploy, rollback, action routing, docs contract.

## Game files

Keep every source file under 120 lines and preserve existing physics modules.

New campaign modules:

- `scripts/levels.js` — declarative level definitions.
- `scripts/progress.js` — persistent unlock/medal state.
- `scripts/challenge-state.js` — per-round goals, shots, success/failure evaluation.
- `scripts/medals.js` — medal scoring policy.
- `scripts/campaign.js` — level selection and unlock coordination.
- `scripts/challenge-ui.js` — mission HUD and level-complete overlay behavior.
- `scripts/hazards.js` — level modifier/hazard state.
- `scripts/render-hazards.js` — hazard drawing.

Touched existing modules are whole-file rewrites only:

- `index.html`
- `styles/arena.css`, `styles/hud.css`, `styles/score.css`, plus a new `styles/campaign.css`
- `scripts/state.js`
- `scripts/systems.js`
- `scripts/round.js`
- `scripts/game-view.js`
- `scripts/game.js`
- `scripts/main.js`

## Dependency graph

`levels -> campaign -> challenge-state -> game/round`

`progress -> campaign`

`hazards -> round + render-hazards -> renderer`

`challenge-ui -> campaign/challenge-state -> game-view`

`publishWebsite -> websitePublicationName -> publicRootPublication -> manifest/transport/verify`
