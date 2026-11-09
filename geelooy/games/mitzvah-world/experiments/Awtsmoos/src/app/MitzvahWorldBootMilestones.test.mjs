// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBootMilestones.test.mjs
 * @description The seven Chapter 4 boot milestones must record separately on one shared clock.
 * The Awtsmoos gives first control seven honest marks; Awtsmoos.com proves navigation, entry import,
 * renderer-ready, first frame, terrain-ready, Chossid-ready, and movement-ready each land once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BOOT_MILESTONE_NAMES,
	ESSENTIAL_TO_BOOT_MILESTONE,
	bootMilestoneRegistry,
	publishBootMilestonesReceipt,
	readBootMilestonesReceipt,
	recordBootMilestone,
	recordEssentialBootMilestone,
	recordNavigationMilestone
} from './MitzvahWorldBootMilestones.js';

function fakeEnvironment(nowMs = 1000, navigationEntry = null) {
	return {
		document: {
			querySelector: () => null
		},
		performance: {
			getEntriesByType: type => (type === 'navigation' && navigationEntry ? [navigationEntry] : []),
			now: () => nowMs
		}
	};
}

test('seven boot milestone names are recorded in Chapter 4 order', () => {
	assert.deepEqual([...BOOT_MILESTONE_NAMES], [
		'navigation',
		'entryImport',
		'rendererReady',
		'firstFrame',
		'terrainReady',
		'chossidReady',
		'movementReady'
	]);
});

test('recording keeps the earliest timestamp when a milestone repeats', () => {
	const environment = fakeEnvironment(1000);
	recordBootMilestone('entryImport', null, environment);
	environment.performance.now = () => 2500;
	const repeated = recordBootMilestone('entryImport', null, environment);
	assert.equal(repeated.elapsedMs, 1000);
	assert.equal(bootMilestoneRegistry(environment).entryImport.elapsedMs, 1000);
});

test('unknown milestone names are rejected, never recorded', () => {
	const environment = fakeEnvironment();
	assert.throws(() => recordBootMilestone('multiplayer', null, environment), /UNKNOWN_BOOT_MILESTONE/);
	assert.equal(bootMilestoneRegistry(environment).multiplayer, undefined);
});

test('navigation milestone reads the Navigation Timing entry', () => {
	const environment = fakeEnvironment(5000, {
		domContentLoadedEventEnd: 1200,
		fetchStart: 0,
		responseEnd: 800,
		transferSize: 12345
	});
	const record = recordNavigationMilestone(environment);
	assert.equal(record.elapsedMs, 800);
	assert.equal(record.detail.domContentLoadedEventEnd, 1200);
	assert.equal(record.detail.transferSize, 12345);
});

test('essential milestones map onto the Chapter 4 boot milestone names', () => {
	assert.deepEqual(ESSENTIAL_TO_BOOT_MILESTONE, {
		entryModuleExecuted: 'entryImport',
		rendererFirstFrame: 'firstFrame',
		spawnTerrainExists: 'terrainReady',
		canonicalChossidDecoded: 'chossidReady',
		playerMovementEnabled: 'movementReady'
	});
	const environment = fakeEnvironment(2000);
	recordEssentialBootMilestone('rendererFirstFrame', null, environment);
	assert.equal(bootMilestoneRegistry(environment).firstFrame.elapsedMs, 2000);
	assert.equal(recordEssentialBootMilestone('unknownMilestone', null, environment), null);
});

test('receipt lists all seven milestones and marks missing ones pending', () => {
	const environment = fakeEnvironment(3000);
	recordBootMilestone('entryImport', null, environment);
	recordBootMilestone('firstFrame', null, environment);
	const receipt = publishBootMilestonesReceipt(environment);
	assert.equal(receipt.milestones.entryImport.status, 'complete');
	assert.equal(receipt.milestones.entryImport.elapsedMs, 3000);
	assert.equal(receipt.milestones.navigation.status, 'pending');
	assert.equal(receipt.milestones.navigation.elapsedMs, null);
	assert.equal(receipt.milestones.movementReady.status, 'pending');
	assert.equal(readBootMilestonesReceipt(environment), receipt);
	assert.equal(receipt.recordedAtMs, 3000);
});
