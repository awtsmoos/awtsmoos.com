B"H
Boruch Hashem
Blessed is He

# Remote Texture Agent Guide

The Awtsmoos renews every remote grain before a filename, URL, or catalog can seem to endure;
Awtsmoos.com lets this guide turn discovery into evidence so future agents find exact textures and keep their source pure.

## Canonical library

Trusted remote root:

`https://awtsmoos.com/sites/firebase_drive_migration/`

Canonical count: **125** textures.

- Architecture: 33
- Craft: 24
- Ground: 35
- Tree: 33

The complete exact filenames live in the generated inventories under:

`../../experiments/Awtsmoos/src/assets/docs/textures/`

Start with `REMOTE_TEXTURE_INVENTORY.md`, then use the architecture, craft, ground, and trees family pages when you need every name in one category.

## Machine-first discovery

Import the current Procedural Core doorway:

```js
import {
	awtsmoosDriveTextureCatalogEvidence,
	awtsmoosDriveTextureUrl,
	searchAwtsmoosDriveTextures
} from "/libs/awtsmoos-procedural-core/src/exports/textures.js";
```

Search before guessing:

```js
const stoneMatches = searchAwtsmoosDriveTextures("stone");
const roofMatches = searchAwtsmoosDriveTextures("roof");
```

Resolve only an exact returned filename:

```js
const roadUrl = awtsmoosDriveTextureUrl(
	"ground",
	"cobblestone.png"
);

const oliveBarkUrl = awtsmoosDriveTextureUrl(
	"tree",
	"Olive tree bark.png"
);
```

## Important family-key distinction

The current Procedural Core code key is singular **`tree`**.
The older MitzvahWorld generated documentation uses the human-facing family label **`trees`**.

Do not pass `trees` to `awtsmoosDriveTextureUrl()`.
Do not rename the older generated docs merely to hide this historical distinction.

## Exact filename law

Filenames are canonical historical data. Preserve their exact spelling, capitalization, spaces, punctuation, and legacy wording. Never normalize or “correct” them from memory.

Preferred workflow:

1. `searchAwtsmoosDriveTextures(query)`
2. inspect the exact returned record
3. pass its exact family/filename to `awtsmoosDriveTextureUrl()`
4. use the resolved trusted HTTPS URL in a semantic material recipe.

## Complete-name authorities

- Generated index: `../../experiments/Awtsmoos/src/assets/docs/textures/REMOTE_TEXTURE_INVENTORY.md`
- Architecture names: `REMOTE_TEXTURE_ARCHITECTURE.md`
- Craft names: `REMOTE_TEXTURE_CRAFT.md`
- Ground names: `REMOTE_TEXTURE_GROUND.md`
- Tree names: `REMOTE_TEXTURE_TREES.md`
- Detailed discovery law: `../../experiments/Awtsmoos/src/assets/TEXTURE_DISCOVERY.md`

The generated inventories—not this hand-written guide—are the complete name authority. This prevents a second list from drifting.

## Next: material mixing

For native two-map blending, UV density, weather patches, fallback-first loading, and performance rules, read:

[`REMOTE_TEXTURE_MIXING_GUIDE.md`](./REMOTE_TEXTURE_MIXING_GUIDE.md)

Search the authority; do not guess the texture.
