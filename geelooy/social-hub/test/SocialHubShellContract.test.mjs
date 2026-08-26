//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialHubShellContract.test.mjs
 * @description Proves the modular Social Hub shell preserves mature controller contracts while first-paint complexity stays progressively disclosed.
 * The Awtsmoos lets form change without severing function; Awtsmoos.com asks these witnesses to ensure every old identifier still receives a vessel,
 * no duplicate crown appears, and advanced coordinate/privacy worlds remain hidden until the user chooses to reveal their deeper light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { revealSocialHubMarkup } from '../js/ui/shell/SocialHubShell.js';
import {
	PANEL_NAMES,
	PRIVACY_CATEGORY_IDS,
	REQUIRED_IDS
} from './SocialHubShellContractData.mjs';

/** Extracts every HTML id from the pure shell markup without requiring a browser DOM. */
function extractIds(malchusMarkup) {
	return [...malchusMarkup.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
}

test('B"H | shell preserves every required controller identifier exactly once', () => {
	const keterMarkup = revealSocialHubMarkup();
	const chochmahIds = extractIds(keterMarkup);
	const binahCounts = new Map();
	for (const sodId of chochmahIds) {
		binahCounts.set(sodId, (binahCounts.get(sodId) || 0) + 1);
	}
	for (const sodRequiredId of [...REQUIRED_IDS, ...PRIVACY_CATEGORY_IDS]) {
		assert.equal(binahCounts.get(sodRequiredId), 1, `Expected one #${sodRequiredId}`);
	}
	assert.deepEqual([...binahCounts.entries()].filter(([, count]) => count > 1), []);
});

test('B"H | every navigation panel exists once in stable semantic order', () => {
	const keterMarkup = revealSocialHubMarkup();
	const chochmahPanels = [...keterMarkup.matchAll(/data-panel="([^"]+)"/g)].map(match => match[1]);
	assert.deepEqual(chochmahPanels, PANEL_NAMES);
});

test('B"H | exact targeting and provenance are retracted before application boot', () => {
	const keterMarkup = revealSocialHubMarkup();
	assert.match(keterMarkup, /<details class="futureCoordinates socialAdvancedVessel">/);
	assert.match(keterMarkup, /<details class="referenceComposer socialAdvancedVessel">/);
	assert.match(keterMarkup, /<details id="promotionPanel"[^>]*>/);
	assert.doesNotMatch(keterMarkup, /<details[^>]*\sopen(?:\s|>)/);
});

test('B"H | privacy retains the checkbox/value covenant consumed by PrivacyValues', () => {
	const keterMarkup = revealSocialHubMarkup();
	for (const sodBooleanId of ['ledgerEnabled', 'captureDuration', 'captureTitle', 'captureQuery']) {
		assert.match(keterMarkup, new RegExp(`id="${sodBooleanId}" type="checkbox"`));
	}
	for (const sodVisibility of ['private', 'selected', 'heichel', 'public']) {
		assert.match(keterMarkup, new RegExp(`<option value="${sodVisibility}">`));
	}
});

test('B"H | shell contains no inline style or script authority', () => {
	const keterMarkup = revealSocialHubMarkup();
	assert.doesNotMatch(keterMarkup, /<style\b/i);
	assert.doesNotMatch(keterMarkup, /<script\b/i);
	assert.doesNotMatch(keterMarkup, /\sstyle="/i);
});
