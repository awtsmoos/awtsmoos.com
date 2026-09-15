//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file meadowLoadingScreenCanonicalUnavailable.test.mjs
 * @description Proves canonical Chossid absence remains visible and blocking world work can reopen a veil hidden for menu choice.
 * The Awtsmoos lets Awtsmoos.com lower the curtain only for deliberate selection; once chosen work begins, the same veil rises
 * before the network crossing and stays truthful through authored-player failure instead of exposing an unfinished HUD shell.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MeadowLoadingScreen } from '../../launcher/MeadowLoadingScreen.js';

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

test('blocking selected-world progress reopens a veil previously finished for the menu', () => {
	const vessel = fixture();
	const screen = new MeadowLoadingScreen(vessel.document, vessel.environment);
	screen.finish();
	assert.equal(vessel.elements.menuBoot.hidden, true);
	assert.equal(vessel.elements.menuBoot.dataset.loadingComplete, 'true');
	screen.world({
		blocking: true,
		message: 'Loading the selected gameplay capability…',
		progress: 0.04
	});
	assert.equal(vessel.elements.menuBoot.hidden, false);
	assert.equal(vessel.elements.menuBoot.dataset.loadingComplete, undefined);
	assert.equal(vessel.elements.menuBoot.dataset.loadingFailure, undefined);
	assert.equal(vessel.elements.menuBoot['aria-hidden'], 'false');
	assert.equal(vessel.elements.menuBoot['aria-busy'], 'true');
	assert.equal(vessel.elements.loadingMessage.textContent, 'Loading the selected gameplay capability…');
	screen.dispose();
});

test('failure keeps the blocking veil visible instead of exposing the world shell', () => {
	const vessel = fixture();
	const screen = new MeadowLoadingScreen(vessel.document, vessel.environment);
	screen.finish();
	screen.fail(new Error('Authored Chossid unavailable'));
	assert.equal(vessel.elements.menuBoot.hidden, false);
	assert.equal(vessel.elements.menuBoot.dataset.loadingFailure, 'true');
	assert.equal(vessel.elements.menuBoot['aria-busy'], 'true');
	assert.equal(vessel.elements.loadingMessage.textContent, 'Authored Chossid unavailable');
	screen.dispose();
});

function fixture() {
	const ids = [
		'mitzvah-world-root', 'menuBoot', 'loadingMessage', 'worldProgress',
		'worldProgressValue', 'modelProgress', 'modelProgressValue', 'modelProgressDetail'
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
		dataset: {}, hidden: false, textContent: '', value: 0,
		removeAttribute(name) { delete this[name]; },
		setAttribute(name, value) { this[name] = String(value); }
	};
}
