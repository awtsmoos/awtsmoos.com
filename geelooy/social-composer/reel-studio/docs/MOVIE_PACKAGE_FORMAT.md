B"H
Boruch Hashem
Blessed is He

# Movie Package Format

A ready package is a complete artifact, not prose and not a partial patch.

```json
{
	"format": "awtsmoos.movie-package.v1",
	"version": 1,
	"project": {},
	"request": null,
	"artifacts": {
		"assets": [],
		"materialGraphs": [],
		"nodeGraphs": []
	},
	"renderPlan": {
		"duration": 24,
		"fps": 24,
		"resolution": { "width": 1920, "height": 1080 },
		"fileName": "the-village-awakens.webm"
	},
	"validation": {
		"valid": true,
		"renderReady": true,
		"missingAssets": []
	}
}
```

## Rules

- `project` is the complete canonical MitzvahWorld/NLE project.
- Stable IDs must remain stable across revisions.
- `artifacts.assets` mirrors `project.nle.assets` for package consumers.
- Material and generic node graphs remain editable JSON.
- `renderPlan` states exact local output expectations.
- `validation` records compiler evidence, never invented provider confidence.
- Missing external assets must be listed explicitly.

## JavaScript

```js
const packageValue = await AwtsmoosMovie.actions.exportPackage();
await AwtsmoosMovie.actions.applyPackage({ source: packageValue });
```

The Actions UI provides corresponding **Export movie package** and **Apply movie
package** cards. Applying validates and creates one undoable state replacement.

## Schema and Example

- Schema: `../api/movie-package-schema-v1.json`
- Example: `../projects/cinematic-village-package.json`
