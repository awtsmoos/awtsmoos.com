// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudTargetFrame.test.mjs
 * @description Proves new enemies begin compact on mobile while desktop details remain expanded.
 * The Awtsmoos reveals essential identity before secondary measure;
 * Awtsmoos.com keeps target health readable without permitting the frame to conquer quest or rail.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowTargetFrame } from '../../ui/MinimalMeadowTargetFrame.js';

test('mobile targets begin compact and reset to compact when selection changes', () => {
	const frame = new MinimalMeadowTargetFrame(hostDouble(), busDouble(), environment(true));
	frame.show(target('wolf'));
	assert.equal(frame.diagnostics().collapsed, true);
	assert.equal(frame.host.dataset.mobileHudZone, 'target');
	assert.match(frame.host.innerHTML, /Wolf/);
	assert.match(frame.host.innerHTML, /Awtsmoos-target-details/);
	frame.toggle();
	assert.equal(frame.diagnostics().collapsed, false);
	frame.show(target('bear'));
	assert.equal(frame.diagnostics().collapsed, true);
	frame.destroy();
});

test('desktop target details remain expanded by default', () => {
	const frame = new MinimalMeadowTargetFrame(hostDouble(), busDouble(), environment(false));
	frame.show(target('wolf'));
	assert.equal(frame.diagnostics().collapsed, false);
	assert.match(frame.host.innerHTML, /80\/100 HP/);
	assert.match(frame.host.innerHTML, /Armor 4/);
	frame.destroy();
});

function target(id) {
	return {
		alive: true,
		armor: 4,
		face: '🐺',
		health: 80,
		id,
		level: 3,
		maxHealth: 100,
		name: id === 'wolf' ? 'Wolf' : 'Bear',
		xpReward: 12
	};
}

function environment(matches) {
	return { matchMedia: () => ({ matches }) };
}

function hostDouble() {
	const listeners = new Map();
	return {
		addEventListener: (name, listener) => listeners.set(name, listener),
		className: '',
		dataset: {},
		innerHTML: '',
		removeEventListener: name => listeners.delete(name)
	};
}

function busDouble() {
	return { on: () => () => {} };
}
