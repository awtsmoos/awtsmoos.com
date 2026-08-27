B"H
Boruch Hashem
Blessed is He

# Tiferes — Final Real-Repository Futurity Plan

The Awtsmoos is beyond every animation and renderer, while Awtsmoos.com may still become a transparent vessel of responsive light;
Tiferes joins beauty and restraint so the interface feels impossible without making the machine fight.

## Procedural verdict: REJECT for the shared site shell

Real inspection found no reusable `geelooy/libs/Awtsmoos` renderer at the named path.

The actual procedural candidates are application-specific:

- Animator procedural code contains character/world generation modules, not a tiny shared WebGL atmosphere renderer.
- Slides procedural code parses/generates presentation documents, not visual particles.
- MitzvahWorld contains a large renderer/particle/procedural ecosystem tightly coupled to a game engine.

Importing those systems into public hub pages would increase coupling, load cost, and lifecycle complexity without a proven benefit. Therefore this pass adds no WebGL dependency. CSS/SVG remains the complete, fast path.

## Exact files to create

1. `geelooy/style/future-system/interaction.css`
	- Owns hover, active, focus-visible, CTA sheen, tactile press.
	- Generated Games and Apps cards included through verified selectors.
	- Wallet button/form interaction included without ambient motion.
	- Social quick actions receive compatible press response only.

2. `geelooy/style/future-system/icon-motion.css`
	- Owns semantic icon motion.
	- No idle loops.
	- Play/send/search/wallet/orbit/create each receive tiny context-specific motion.

3. `geelooy/style/future-system/performance.css`
	- Owns safe rendering hints.
	- `content-visibility` only for large Games/Apps catalogs.
	- No permanent `will-change` blanket.

## Exact files to rewrite completely

4. `geelooy/style/future-system/motion.css`
	- Keep reveal lifecycle only.
	- Remove hover/press responsibilities now moving to `interaction.css`.

5. `geelooy/style/future-system/index.css`
	- Import tokens, atmosphere, surfaces, reveal motion, interaction, icon motion, performance.
	- Advance shared cache generation to `future-002`.

6. `geelooy/apps/index.html`
	- Preserve the newest 77-line “Every Browser Tool” content exactly in meaning and contract.
	- Preserve `apps-portfolio-005`, all categories, data mounts, routes, and scripts.
	- Add future-002 CSS/JS, Apps page accent identity, hero/surface/aura/reveal hooks, semantic icons, filter/catalog reveal hooks.

7. `geelooy/games/index.html`
	- Preserve current Games content and routes.
	- Advance future CSS/JS references to future-002 only unless readback reveals a useful safe interaction hook.

8. `geelooy/apps/wallet/index.html`
	- Preserve forms, IDs, Wallet copy, store mounts, and business scripts.
	- Advance future CSS/JS references to future-002.

9. `geelooy/about/index.html`
	- Preserve current About copy and shell.
	- Advance future CSS/JS references to future-002.

10. `geelooy/social-hub/style.css`
	- Preserve all current imports.
	- Advance only the shared future-system import to future-002.

11. `geelooy/scripts/future-system/futureSystemContract.test.mjs`
	- Update adoption version to future-002.
	- Lock tactile `:active`, focus-visible, icon-motion, content-visibility, fail-visible reveal, route exclusions, and no procedural/WebGL import.

## Implementation order

1. Read current Games, Wallet, About, Social style, and contract files fully.
2. Write all new CSS modules.
3. Rewrite motion/index manifest.
4. Rewrite Apps against its newest current content.
5. Rewrite Games, Wallet, About, and Social style with cache-generation only plus safe hooks already present.
6. Rewrite the contract test.
7. Read every touched file completely.
8. Run line-count, indentation, syntax, tests, diff check, and search for accidental WebGL/procedural imports.
9. Browser verify Games, Apps, Wallet, About, and Social at desktop and narrow width.
10. Inspect hover, active, keyboard focus, reduced-motion, console errors, and layout geometry.

## Acceptance

The pass succeeds when the pages feel more tactile and futuristic while adding effectively zero continuous JavaScript cost. Buttons should press, icons should answer, cards should lift and settle, keyboard focus should remain unmistakable, and long catalogs should render lazily without hiding content. No WebGL engine is allowed to enter this architecture merely for decoration.
