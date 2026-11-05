// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowWaterFallbackNormals.test.mjs
 * @description Proves Simple Meadow owns two bounded cached normal fields immediately while visible water imagery remains remote-pending.
 * The Awtsmoos lets reflected light move before the network speaks; Awtsmoos.com verifies these local pixels are shader vectors only,
 * cached by document and never mislabeled as hosted river color, stone, or earth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowWaterFallbackSources } from '../../app/MinimalMeadowWaterFallbackSources.js';
import { createMinimalMeadowProceduralWaterNormals } from '../../app/MinimalMeadowProceduralWaterNormals.js';

function fakeDocument() {
	const canvases = [];
	return {
		canvases,
		createElement(tagName) {
			assert.equal(tagName, 'canvas');
			const canvas = {
				dataset: {},
				getContext() {
					return {
						createImageData(width, height) {
							return { data: new Uint8ClampedArray(width * height * 4) };
						},
						putImageData() {}
					};
				}
			};
			canvases.push(canvas);
			return canvas;
		}
	};
}

test('B"H two 128px normal fields are deterministic and cached per document', () => {
	const documentValue = fakeDocument();
	const first = createMinimalMeadowProceduralWaterNormals(documentValue);
	const second = createMinimalMeadowProceduralWaterNormals(documentValue);
	assert.equal(first, second);
	assert.equal(first.length, 2);
	assert.equal(documentValue.canvases.length, 2);
	assert.deepEqual(first.map(canvas => [canvas.width, canvas.height]), [[128, 128], [128, 128]]);
	assert.deepEqual(first.map(canvas => canvas.dataset.awtsmoosWaterNormal), ['613', '991']);
});

test('B"H fallback keeps visible photographs pending while both shader normals are ready', () => {
	const documentValue = fakeDocument();
	const sources = createMinimalMeadowWaterFallbackSources({ document: documentValue });
	assert.equal(sources.activeNormalSources, 2);
	assert.equal(sources.localNormalsReady, 2);
	assert.equal(sources.normalMode, 'procedural-dual-flow-normal');
	assert.equal(sources.color, null);
	assert.equal(sources.detail, null);
	assert.equal(sources.bank, null);
	assert.equal(sources.bed, null);
	assert.equal(sources.remoteOnly, false);
	assert.deepEqual(sources.provenance, [
		'procedural://awtsmoos-water-normal/613',
		'procedural://awtsmoos-water-normal/991'
	]);
});
