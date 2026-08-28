// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos keeps Awtsmoos.com responsive behavior bound to the real composer vessel:
 * focused screens reveal one major panel, preview becomes a sheet, and Advanced never explodes panels open automatically.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = {
	responsive: new URL('../js/civilization/responsivePanels.js', import.meta.url),
	viewport: new URL('../js/civilization/composerViewport.js', import.meta.url),
	preview: new URL('../js/civilization/previewSheet.js', import.meta.url)
};

const [responsive, viewport, preview] = await Promise.all([
	readFile(files.responsive, 'utf8'),
	readFile(files.viewport, 'utf8'),
	readFile(files.preview, 'utf8')
]);

assert.match(
	responsive,
	/configureMajorPanels\(\{ preferContent: true \}\)/,
	'initialization should intentionally begin with the content panel'
);
assert.doesNotMatch(
	responsive,
	/panels\.forEach\(panel => panel\.open = true\)/,
	'Advanced mode must never automatically open every major panel'
);
assert.match(
	responsive,
	/allowManualExpansion/,
	'wide Advanced mode may preserve only user-requested expansion'
);
assert.match(
	viewport,
	/getBoundingClientRect\(\)/,
	'width policy should measure the composer vessel itself'
);
assert.match(
	viewport,
	/ResizeObserver/,
	'composer geometry should respond to container changes'
);
assert.match(
	preview,
	/aria-hidden/,
	'preview sheet should publish visibility semantics'
);
assert.match(
	preview,
	/\.inert\s*=/,
	'hidden preview should leave the keyboard interaction graph'
);
assert.match(
	preview,
	/previewInvoker\?\.focus/,
	'closing preview should restore the invoking control when possible'
);

for (const [name, source] of Object.entries({ responsive, viewport, preview })) {
	const lineCount = source.trimEnd().split('\n').length;
	assert.ok(lineCount <= 120, `${name} must remain within the 120-line vessel law; saw ${lineCount}`);
}

console.log('B"H responsive panels contract verified.');
