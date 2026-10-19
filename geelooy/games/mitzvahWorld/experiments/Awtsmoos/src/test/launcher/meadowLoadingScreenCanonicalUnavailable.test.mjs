// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meadowLoadingScreenCanonicalUnavailable.test.mjs
 * @description Proves the strict loader blocks before readiness, reveals certified readiness, and preserves failure evidence.
 * The Awtsmoos lets Awtsmoos.com lower the curtain only after the real boot road reaches world-loading;
 * authored-player absence remains visible without a second reporting fracture hiding the first one.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { transitionMitzvahWorldBootState } from '../../app/MitzvahWorldBootStateMachine.js';
import { MeadowLoadingScreen } from '../../launcher/MeadowLoadingScreen.js';

test('canonical-unavailable says gameplay is held for the authored Chossid', () => {
	const vessel = fixture();
	const screen = new MeadowLoadingScreen(vessel.document, vessel.environment);
	screen.model({ phase: 'canonical-unavailable' });
	assert.equal(vessel.elements.modelProgressDetail.textContent, 'Authored Chossid unavailable · gameplay held');
	assert.equal(vessel.elements.modelProgressDetail.textContent.includes('fallback'), false);
	screen.dispose();
});

test('blocking world progress stays visible before certified readiness', () => {
	const vessel = fixture();
	const screen = new MeadowLoadingScreen(vessel.document, vessel.environment);
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

test('certified world-loading state can finish exactly through ready', () => {
	const vessel = fixture();
	const screen = new MeadowLoadingScreen(vessel.document, vessel.environment);
	prepareWorldLoading(vessel);
	screen.finish(certifiedEssential());
	assert.equal(vessel.elements.menuBoot.hidden, true);
	assert.equal(vessel.elements.menuBoot.dataset.loadingComplete, 'true');
	assert.equal(vessel.elements['mitzvah-world-root'].dataset.awtsmoosGameplay, 'true');
});

test('failure stays blocking without throwing while reporting the original fracture', () => {
	const vessel = fixture();
	const screen = new MeadowLoadingScreen(vessel.document, vessel.environment);
	const receipt = screen.fail(new Error('Authored Chossid unavailable'));
	assert.equal(receipt.message, 'Authored Chossid unavailable');
	assert.equal(vessel.elements.menuBoot.hidden, false);
	assert.equal(vessel.elements.menuBoot.dataset.loadingFailure, 'true');
	assert.equal(vessel.elements.menuBoot['aria-busy'], 'true');
	assert.equal(vessel.elements.loadingMessage.textContent, 'Authored Chossid unavailable');
	screen.dispose();
});

function prepareWorldLoading(vessel) {
	for (const state of ['painting', 'launcher-loading', 'launching', 'world-loading']) {
		assert.equal(transitionMitzvahWorldBootState(vessel.environment, vessel.document, state), state);
	}
}

function certifiedEssential() {
	const names = ['canvas', 'renderer', 'terrain', 'player', 'controls'];
	return {
		certified: true,
		milestones: Object.fromEntries(names.map(name => [name, { status: 'complete' }]))
	};
}

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
