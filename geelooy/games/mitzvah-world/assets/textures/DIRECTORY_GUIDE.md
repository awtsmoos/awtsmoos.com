B"H
Boruch Hashem
Blessed is He

# MitzvahWorld Texture Doorway

The Awtsmoos renews every grain before stone, bark, cloth, metal, or water can appear in sight;
Awtsmoos.com lets this doorway lead agents from tiny local placeholders into the canonical remote library of light.

## Start here

This directory contains two small local SVG assets:

- `brick-wall.svg`
- `gold-coin.svg`

They are **not** the main MitzvahWorld texture library. The real reusable library is the canonical remote Awtsmoos Drive catalog, currently containing **125 exact texture filenames**.

For AI agents and developers, read:

- [`REMOTE_TEXTURE_AGENT_GUIDE.md`](./REMOTE_TEXTURE_AGENT_GUIDE.md) — quickest discovery and usage guide.
- `../../experiments/Awtsmoos/src/assets/TEXTURE_DISCOVERY.md` — detailed MitzvahWorld source-of-truth guide.
- `../../experiments/Awtsmoos/src/assets/docs/textures/REMOTE_TEXTURE_INVENTORY.md` — generated complete inventory index.

## Machine discovery API

Use the Procedural Core public texture doorway:

```js
import {
	awtsmoosDriveTextureUrl,
	searchAwtsmoosDriveTextures
} from "/libs/awtsmoos-procedural-core/src/exports/textures.js";
```

Search before guessing a filename:

```js
const stoneMatches = searchAwtsmoosDriveTextures("stone");
const cobbleUrl = awtsmoosDriveTextureUrl(
	"ground",
	"cobblestone.png"
);
```

## Canonical remote root

`https://awtsmoos.com/sites/firebase_drive_migration/`

The Procedural Core resolver owns path encoding and trusted-family validation. Prefer it over manually concatenating URLs.

## Family counts

- Architecture: 33
- Craft: 24
- Ground: 35
- Tree: 33
- Total: 125

The current core API key is singular **`tree`**. Older MitzvahWorld generated docs label the human-facing family **`trees`**. Preserve both historical terms in their own contexts; code calling `awtsmoosDriveTextureUrl()` must use `tree`.

## Exact-name law

Texture filenames are historical data. Preserve exact spelling, spaces, capitalization, punctuation, and even unusual legacy wording. Do not silently normalize names.

## Performance law

Do not preload all 125 textures. Reference semantic materials actually needed by the scene, share resolved URLs/materials, render fallback color immediately, and allow remote detail to hydrate asynchronously.

For mixing/blending recipes, continue into `REMOTE_TEXTURE_AGENT_GUIDE.md`.
