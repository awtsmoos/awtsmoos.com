//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalMeadowCinematicPresentation.test.mjs
 * @description Proves the cinematic garment is singular, reversible, and attached to real UI selectors.
 * The Awtsmoos renews each vessel while ownership remains measured; Awtsmoos.com verifies that
 * beauty never duplicates authority and never survives after its final lawful owner departs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowCinematicPresentation } from '../../ui/cinematic/MinimalMeadowCinematicPresentation.js';
import {
	MINIMAL_MEADOW_CINEMATIC_STYLE_ID,
	minimalMeadowCinematicCss
} from '../../ui/cinematic/MinimalMeadowCinematicStyles.js';

function cinematicDocumentFixture(previousMarker) {
	const elementsById = new Map();
	const documentElement = {
		dataset: {}
	};
	if (previousMarker !== undefined) {
		documentElement.dataset.awtsmoosCinematic = previousMarker;
	}
	const head = {
		append(element) {
			if (element.id) elementsById.set(element.id, element);
		}
	};
	return {
		createElement(tagName) {
			return { id: '', tagName, textContent: '' };
		},
		documentElement,
		getElementById(id) {
			return elementsById.get(id) || null;
		},
		head
	};
}

test('cinematic presentation installs one shared style and reference-counts the marker', () => {
	const documentValue = cinematicDocumentFixture();
	const first = new MinimalMeadowCinematicPresentation(documentValue);
	const second = new MinimalMeadowCinematicPresentation(documentValue);
	assert.equal(documentValue.documentElement.dataset.awtsmoosCinematic, 'true');
	assert.equal(first.styleElement, second.styleElement);
	assert.equal(first.styleElement.id, MINIMAL_MEADOW_CINEMATIC_STYLE_ID);
	assert.equal(first.diagnostics().active, true);
	assert.equal(first.diagnostics().styleReady, true);
	first.destroy();
	assert.equal(documentValue.documentElement.dataset.awtsmoosCinematic, 'true');
	second.destroy();
	assert.equal(documentValue.documentElement.dataset.awtsmoosCinematic, undefined);
});

test('cinematic presentation restores a pre-existing document marker', () => {
	const documentValue = cinematicDocumentFixture('legacy');
	const presentation = new MinimalMeadowCinematicPresentation(documentValue);
	assert.equal(documentValue.documentElement.dataset.awtsmoosCinematic, 'true');
	presentation.destroy();
	assert.equal(documentValue.documentElement.dataset.awtsmoosCinematic, 'legacy');
});

test('cinematic stylesheet targets real Blank Meadow gameplay surfaces', () => {
	const css = minimalMeadowCinematicCss();
	for (const selector of [
		'.Awtsmoos-minimap',
		'.Awtsmoos-quest-mini-tracker',
		'.Awtsmoos-game-rail',
		'.Awtsmoos-region-banner',
		'.Awtsmoos-core-mechanics'
	]) {
		assert.match(css, new RegExp(selector.replace('.', '\\.')));
	}
	assert.match(css, /data-awtsmoos-cinematic="true"/);
	assert.match(css, /safe-area-inset-bottom/);
	assert.doesNotMatch(css, /!important/);
});
