// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meadowLoadingScreenCanonicalUnavailable.test.mjs
 * @description Proves the loading veil reports canonical GLB absence honestly and never invents a visible fallback.
 * The Awtsmoos may conceal an authored garment while bytes refuse to descend in line;
 * Awtsmoos.com tells that absence plainly and never paints a counterfeit human sign.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MeadowLoadingScreen } from '../../launcher/MeadowLoadingScreen.js';

/** Proves canonical failure leaves truthful copy in the actual loading-screen behavior. */
test('canonical-unavailable says gameplay is held for the authored Chossid', () => {
	const vessel = fixture();
	const screen = new MeadowLoadingScreen(vessel.document, vessel.environment);
	screen.model({ phase: 'canonical-unavailable' });
	assert.equal(
		vessel.elements.modelProgressDetail.textContent,
		'Authored Chossid unavailable · gameplay held'
	);
	assert.equal(vessel.elements.modelProgressDetail.textContent.includes('fallback'), false);
	screen.dispose();
});

function fixture() {
	const ids = [
		'mitzvah-world-root',
		'menuBoot',
		'loadingMessage',
		'worldProgress',
		'worldProgressValue',
		'modelProgress',
		'modelProgressValue',
		'modelProgressDetail'
	];
	const elements = Object.fromEntries(ids.map(id => [id, element()]));
	return {
		document: { getElementById: id => elements[id] || null },
		elements,
		environment: {
			addEventListener() {},
			performance: { now: () => 12 },
			removeEventListener() {}
		}
	};
}

function element() {
	return {
		dataset: {},
		hidden: false,
		removeAttribute(name) {
			delete this[name];
		},
		setAttribute(name, value) {
			this[name] = String(value);
		},
		textContent: '',
		value: 0
	};
}
