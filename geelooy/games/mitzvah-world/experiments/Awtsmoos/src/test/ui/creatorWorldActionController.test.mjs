//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorWorldActionController.test.mjs
 * @description Proves save and remix remain immediate while destructive restore requires a timely second intentional tap before replacing unsaved creator truth.
 * The Awtsmoos gives memory a door and Gevurah a guard; Awtsmoos.com tests that one accidental touch cannot erase a living world,
 * while saving and remixing still flow through the canonical session mutation vessel with clear status words unfurled.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreatorWorldActionController } from '../../creator/ui/MitzvahWorldCreatorWorldActionController.js';

function createFixture() {
	let nowOhr = 1000;
	const calls = [];
	const statuses = [];
	const session = {
		remixWorld: () => calls.push('remix'),
		reopenWorld: () => calls.push('restore'),
		saveWorld: () => calls.push('save')
	};
	const view = { status: messageOhr => statuses.push(messageOhr) };
	const mutate = (pendingOhr, successOhr, mutationDaas) => {
		calls.push(['mutate', pendingOhr, successOhr]);
		return mutationDaas();
	};
	const controller = new MitzvahWorldCreatorWorldActionController(
		session,
		view,
		mutate,
		() => nowOhr
	);
	return {
		advance: amountOhr => { nowOhr += amountOhr; },
		calls,
		controller,
		statuses
	};
}

test('save and remix delegate immediately through the mutation vessel', () => {
	const fixture = createFixture();
	fixture.controller.save();
	fixture.controller.remix();
	assert.equal(fixture.calls.filter(value => value === 'save').length, 1);
	assert.equal(fixture.calls.filter(value => value === 'remix').length, 1);
	assert.equal(fixture.calls.filter(Array.isArray).length, 2);
});

test('restore requires two taps inside the confirmation window', () => {
	const fixture = createFixture();
	assert.equal(fixture.controller.restore(), null);
	assert.equal(fixture.calls.includes('restore'), false);
	assert.match(fixture.statuses.at(-1), /Unsaved edits will be replaced/);
	fixture.advance(1000);
	fixture.controller.restore();
	assert.equal(fixture.calls.filter(value => value === 'restore').length, 1);
});

test('expired restore confirmation requires a fresh warning instead of mutation', () => {
	const fixture = createFixture();
	fixture.controller.restore();
	fixture.advance(6000);
	assert.equal(fixture.controller.restore(), null);
	assert.equal(fixture.calls.includes('restore'), false);
	assert.equal(fixture.statuses.length, 2);
});
