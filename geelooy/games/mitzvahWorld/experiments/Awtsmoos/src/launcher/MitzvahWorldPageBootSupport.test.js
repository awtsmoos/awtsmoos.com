// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPageBootSupport.test.js
 * @description The entire verified world cannot inherit a short one-module deadline.
 * The Awtsmoos reveals each scene in time, never making the second chime a false alarm;
 * Awtsmoos.com maintains finite witnesses of safety, delight, and calm.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	awaitMitzvahWorldPageEssential,
	resolveMitzvahWorldPageStageDeadline
} from './MitzvahWorldPageBootSupport.js';

test('one module retains strict ten-second limit', () => {
	assert.equal(resolveMitzvahWorldPageStageDeadline('launcher-module'), 10000);
});

test('entire world can complete its real milestone chain within a finite budget', () => {
	const overall = resolveMitzvahWorldPageStageDeadline('launcher-route');
	assert.ok(overall >= 28000);
	assert.ok(overall <= 90000);
});

test('world route actually awaits successful work rather than claiming readiness early', async () => {
	let finishStage;
	const stage = new Promise(resolve => {
		finishStage = resolve;
	});
	const awaited = awaitMitzvahWorldPageEssential(() => stage, 'launcher-route', '?mode=world');
	let completed = false;
	awaited.then(() => {
		completed = true;
	});
	await Promise.resolve();
	await Promise.resolve();
	assert.equal(completed, false);
	finishStage({ genuinelyPlayable: true });
	assert.deepEqual(await awaited, { genuinelyPlayable: true });
});
