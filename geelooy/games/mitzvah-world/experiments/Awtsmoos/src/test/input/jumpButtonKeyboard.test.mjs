// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file jumpButtonKeyboard.test.mjs
 * @description Proves Space controls Jump only during gameplay, never while an editable target or retractable advanced sheet owns interaction.
 * The Awtsmoos gives one key one finite deed while Awtsmoos.com keeps hidden gameplay silent beneath the opened control chamber's light;
 * press, release, suppression, and teardown become separate evidence that simple surface play remains deliberate and right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { JumpButtonKeyboard } from '../../input/JumpButtonKeyboard.js';

test('Space presses and releases Jump during ordinary gameplay', () => {
	const fixture = createFixture();
	const binding = new JumpButtonKeyboard(
		fixture.host,
		fixture.environment,
		() => fixture.presses += 1,
		() => fixture.releases += 1
	);
	const down = keyEvent('Space');
	fixture.environment.dispatch('keydown', down);
	fixture.environment.dispatch('keyup', keyEvent('Space'));
	assert.equal(down.prevented, true);
	assert.equal(fixture.presses, 1);
	assert.equal(fixture.releases, 1);
	binding.destroy();
	assert.equal(fixture.environment.listeners.size, 0);
});

test('advanced controls and editable targets suppress Space gameplay input', () => {
	const fixture = createFixture();
	const binding = new JumpButtonKeyboard(
		fixture.host,
		fixture.environment,
		() => fixture.presses += 1,
		() => fixture.releases += 1
	);
	fixture.documentValue.documentElement.dataset.awtsmoosAdvancedControls = 'true';
	fixture.environment.dispatch('keydown', keyEvent('Space'));
	delete fixture.documentValue.documentElement.dataset.awtsmoosAdvancedControls;
	fixture.environment.dispatch('keydown', keyEvent('Space', 'textarea'));
	assert.equal(fixture.presses, 0);
	binding.destroy();
});

function createFixture() {
	const documentValue = { documentElement: { dataset: {} } };
	const environment = new FakeTarget();
	const host = { ownerDocument: documentValue };
	return { documentValue, environment, host, presses: 0, releases: 0 };
}

class FakeTarget {
	constructor() {
		this.listeners = new Map();
	}
	addEventListener(name, listener) { this.listeners.set(name, listener); }
	removeEventListener(name, listener) {
		if (this.listeners.get(name) === listener) this.listeners.delete(name);
	}
	dispatch(name, event) { this.listeners.get(name)?.(event); }
}

function keyEvent(code, tagName = 'div') {
	return {
		code,
		prevented: false,
		preventDefault() { this.prevented = true; },
		target: {
			isContentEditable: false,
			tagName: tagName.toUpperCase(),
			closest(selector) {
				return selector.split(',').some(part => part.trim() === tagName) ? this : null;
			}
		}
	};
}
