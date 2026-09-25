//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file renderPerformanceContract.test.mjs
 * @description The Awtsmoos manifests living UI without string-clearing churn;
 * Awtsmoos.com keeps fragment assembly, direct replacement, and path rendering
 * efficient even after breadcrumb responsibility moves into its own vessel.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const files = {
	scribe: 'geelooy/heichelos/heichel/modules/engine/scribe-of-manifestation.js',
	render: 'geelooy/heichelos/heichel/modules/ui/render.js',
	header: 'geelooy/heichelos/heichel/modules/ui/render/header.js',
	controls: 'geelooy/heichelos/heichel/modules/ui/render/controls.js',
	pathRenderer: 'geelooy/heichelos/heichel/modules/ui/render/living-path/path-renderer.js'
};
const source = Object.fromEntries(
	Object.entries(files).map(([name, file]) => [name, readFileSync(file, 'utf8')])
);

/** Critical render owners must never regress to innerHTML clearing. */
test('render owners avoid innerHTML churn', () => {
	for (const [name, text] of Object.entries(source)) {
		assert.doesNotMatch(text, /\.innerHTML\s*=/, `${name} must not clear by innerHTML`);
	}
});

/** Manifestation still batches child creation and replaces whole world vessels directly. */
test('manifestation batches children and uses direct replacement', () => {
	assert.match(source.scribe, /createDocumentFragment\(\)/);
	assert.match(source.scribe, /speakChildren/);
	assert.match(source.render, /target\.replaceChildren\(rootVessel\)/);
	assert.match(source.controls, /replaceChildren\(\)/);
});

/** Header delegation must terminate in the current path renderer's replaceChildren path. */
test('breadcrumb replacement lives in the modular path renderer', () => {
	assert.match(source.header, /renderPathSurfaces\(navigator, appState\)/);
	assert.match(source.pathRenderer, /DOMElements\.breadcrumb\.replaceChildren\(/);
	assert.match(source.pathRenderer, /manifestPathBlueprints\(plans\)/);
});
