B"H
Boruch Hashem
Blessed is He

# Temple Runner Remote Texture Discovery

The Awtsmoos renews every byte before network, cache, shader, or filename can pretend to be the source of visible form;
Awtsmoos.com lets one trusted catalog guide every agent from exact name to layered Jerusalem realism without URL archaeology in a storm.

## Canonical authority

- Public Core doorway: `geelooy/libs/awtsmoos-procedural-core/src/exports/textures.js`
- Catalog: `src/core/assets/textures/AwtsmoosDriveTextureCatalog.js` inside Procedural Core.
- Game resolver: `src/realism/TempleSurfaceRecipeTools.js` → `templeTexture(family, exactFilename)`.
- Trusted transport owns the remote root. **Never hardcode the Drive root in game recipes.**

## Discovery API

```js
import {
	AWTSMOOS_DRIVE_TEXTURE_FAMILIES,
	awtsmoosDriveTextureCatalogEvidence,
	awtsmoosDriveTextureUrl,
	searchAwtsmoosDriveTextures
} from "../../../../libs/awtsmoos-procedural-core/src/exports/textures.js?compact=true";
```

Use `searchAwtsmoosDriveTextures("stone")` to discover candidates. Resolve only an exact returned `family` + `name` with `awtsmoosDriveTextureUrl` or the Temple `templeTexture` wrapper.

## Catalog evidence

- Architecture: **33**
- Craft: **24**
- Ground: **35**
- Tree: **33**
- Total canonical textures: **125**

Family files: [ARCHITECTURE.md](./ARCHITECTURE.md), [CRAFT.md](./CRAFT.md), [GROUND.md](./GROUND.md), [TREE.md](./TREE.md).
Current game usage: [CURRENT_TEMPLE_USAGE.md](./CURRENT_TEMPLE_USAGE.md).

## Temple material pipeline

1. A procedural mesh renders immediately with a semantic fallback color.
2. `NativeLayeredMaterialHydrator` progressively hydrates base `mapUrl` and optional `mixUrl`.
3. `NetzachTempleEcologicalMaterialHydrator` reuses the same trusted Core loader/cache for ecological layer URLs.
4. Native `textureLayers` then react to slope, height, wetness, UV repeat/angle, and the four Core ecology zones.
5. `Visual quality` controls future decode size, queue concurrency, and atmosphere budgets without destructively re-decoding cached textures.

## Agent rules

- Filenames are exact and case-sensitive; preserve spaces and capitalization.
- Never guess a filename. Search the Core catalog.
- Never hand-encode spaces or construct the remote root.
- Prefer one physically meaningful base/mix pair; add ecological layers only when slope/place/weather genuinely improves realism.
- Roads use Core zone `[0,1,0,0]`; untagged geometry uses the Core generic fallback `[1,0,0,0]`.
- Keep hazard/lane/reward readability independent of remote-texture success.
- Remote failure must degrade to fallback/base material, never block gameplay.
