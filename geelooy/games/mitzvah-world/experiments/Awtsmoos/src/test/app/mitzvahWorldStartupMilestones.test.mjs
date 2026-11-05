// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldStartupMilestones.test.mjs
 * @description Proves startup timing keeps first truth, monotonic elapsed values, and immutable browser receipts.
 * The Awtsmoos renews each instant without rewriting what was already revealed;
 * Awtsmoos.com lets the first measured spark remain first, so cold-load evidence cannot be quietly concealed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldStartupMilestones } from '../../app/MitzvahWorldStartupMilestones.js';

test('startup milestone origin and elapsed values follow the injected clock', () => {
	let time = 12;
	const environment = {};
	const milestones = new MitzvahWorldStartupMilestones({
		environment,
		clock: () => time
	});
	const first = milestones.mark('scriptStart');
	time = 37;
	const second = milestones.mark('rendererReady');
	assert.equal(first.elapsedMilliseconds, 0);
	assert.equal(second.elapsedMilliseconds, 25);
	assert.equal(environment.AwtsmoosMitzvahWorldStartup.originMilliseconds, 12);
});

test('duplicate marks preserve the first observation', () => {
	let time = 4;
	const milestones = new MitzvahWorldStartupMilestones({
		environment: {},
		clock: () => time
	});
	const first = milestones.mark('firstTerrainVisible');
	time = 999;
	const duplicate = milestones.mark('firstTerrainVisible');
	assert.equal(duplicate, first);
	assert.equal(duplicate.atMilliseconds, 4);
});

test('published snapshots are frozen value receipts', () => {
	const environment = {};
	const milestones = new MitzvahWorldStartupMilestones({
		environment,
		clock: () => 1
	});
	milestones.mark('scriptStart');
	const snapshot = milestones.snapshot();
	assert.equal(Object.isFrozen(snapshot), true);
	assert.equal(Object.isFrozen(snapshot.milestones), true);
	assert.equal(Object.isFrozen(snapshot.milestones.scriptStart), true);
	assert.deepEqual(Object.keys(snapshot.milestones), ['scriptStart']);
});
