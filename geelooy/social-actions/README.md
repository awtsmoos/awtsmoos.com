# B"H
# Boruch Hashem
# Blessed is He

# Geelooy Social Actions

This folder contains reusable browser actions that connect existing content surfaces to the unified social graph without copying canonical content.

## Post reference URL

```js
import { buildPostReferenceUrl } from './PostReferenceUrl.js';

const href = buildPostReferenceUrl({
	aliasId: 'active-alias',
	postId: 'canonical-post-id',
	heichelId: 'canonical-heichel',
	seriesId: 'canonical-series',
	authorAliasId: 'source-author',
	targetHeichel: 'optional-target',
	targetSeries: 'root',
	returnPath: location.pathname
});
```

The generated composer URL carries:

- source type;
- source ID;
- canonical Heichel;
- canonical series;
- source author alias;
- optional acting alias;
- optional target destination;
- safe same-origin return path.

It never carries copied title, body, rich blocks, sections, media blobs, comments, reactions, answers, or analytics.

## Mounting the action

```js
import { mountPostReferenceAction } from './PostReferenceAction.js';

mountPostReferenceAction({
	container: document.querySelector('.postActions'),
	context: {
		aliasId: activeAliasId,
		postId,
		heichelId,
		seriesId,
		authorAliasId,
		returnPath: location.pathname
	}
});
```

A declarative surface may instead provide:

```html
<div
	data-awtsmoos-reference-action
	data-alias-id="active-alias"
	data-post-id="canonical-post"
	data-heichel-id="canonical-heichel"
	data-series-id="canonical-series"
	data-author-alias-id="source-author"
></div>
```

Then call `mountDatasetReferenceActions(document)`.

## Canonical behavior

When the unified composer receives source parameters, it locks the original Heichel and series as the canonical origin. Selecting another destination creates a reference placement or moderated placement submission.

## Integration boundary

The reusable action and URL contract are complete and tested. Existing renderer files should import and mount it only after their complete current source and dirty status are inspected. They must never be modified through a blind insertion or text replacement.

## Test

```bash
node tests/postReferenceUrl.test.mjs
```

The Awtsmoos is one before every displayed post. This action lets the same light enter another Heichel without claiming a second birthplace, second author, or copied soul on Awtsmoos.com.