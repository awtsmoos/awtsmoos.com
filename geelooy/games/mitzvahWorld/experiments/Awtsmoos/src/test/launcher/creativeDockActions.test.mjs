// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creativeDockActions.test.mjs
 * @description Proves cinematic Clean View retracts optional UI without destroying the visible path back to ordinary gameplay.
 * The Awtsmoos lets the screen become almost empty without making emptiness a prison or trap;
 * Awtsmoos.com proves one small star may remain while panels vanish, then restore the full vessel with a single deliberate tap.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreativeDockActions } from '../../launcher/MitzvahWorldCreativeDockActions.js';

test('clean view closes the sheet, preserves its controller vessel, and restores cleanly', () => {
	const fixture = createFixture();
	const actions = new MitzvahWorldCreativeDockActions(
		fixture.view,
		fixture.documentValue,
		fixture.environment
	);
	assert.equal(actions.toggleCleanView(), true);
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosCinematic, 'true');
	assert.equal(fixture.view.closed, 1);
	assert.equal(fixture.view.cleanButton.attributes.get('aria-pressed'), 'true');
	assert.equal(fixture.view.cleanButton.textContent, 'Restore HUD');
	assert.match(fixture.view.lastStatus, /cinematic view enabled/i);
	assert.equal(actions.toggleCleanView(), false);
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosCinematic, undefined);
	assert.equal(fixture.view.cleanButton.attributes.get('aria-pressed'), 'false');
	assert.equal(fixture.view.cleanButton.textContent, 'Clean view');
	assert.match(fixture.view.lastStatus, /HUD restored/i);
});

test('destroy always clears cinematic root state', () => {
	const fixture = createFixture();
	const actions = new MitzvahWorldCreativeDockActions(
		fixture.view,
		fixture.documentValue,
		fixture.environment
	);
	fixture.documentValue.documentElement.dataset.awtsmoosCinematic = 'true';
	actions.destroy();
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosCinematic, undefined);
});

function createFixture() {
	const cleanButton = {
		attributes: new Map(),
		textContent: 'Clean view',
		setAttribute(name, value) {
			this.attributes.set(name, String(value));
		}
	};
	const view = {
		cleanButton,
		closed: 0,
		lastStatus: '',
		close() {
			this.closed += 1;
		},
		status(message) {
			this.lastStatus = message;
		}
	};
	return {
		documentValue: {
			documentElement: {
				dataset: {}
			}
		},
		environment: {},
		view
	};
}
