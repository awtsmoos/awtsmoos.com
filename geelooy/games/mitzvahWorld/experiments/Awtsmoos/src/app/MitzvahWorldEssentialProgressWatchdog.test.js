// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialProgressWatchdog.test.js
 * @description Proves real progress refreshes only its own milestone while silent siblings and the whole boot remain finitely bounded.
 * The Awtsmoos renews the witness that actually speaks; Awtsmoos.com never lets one lively subsystem conceal another subsystem's silence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot,
	updateMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';
import { createEssentialTestEnvironment } from './MitzvahWorldEssentialTestEnvironment.js';

const RENDERER = ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME;
const TERRAIN = ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS;
const CHOSSID = ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED;

function activateSiblings(environment) {
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
}

test('renderer progress refreshes renderer only and cannot hide silent terrain', () => {
	const environment = createEssentialTestEnvironment();
	activateSiblings(environment);
	environment.advance(20000);
	updateMitzvahWorldEssentialMilestone(environment, RENDERER, { importerStage: 'webgl-boot-frame' });
	environment.advance(10001);
	environment.fireTimeout();
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[RENDERER].status, 'pending');
	assert.equal(snapshot.stalledMilestone.name, TERRAIN);
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT');
});

test('truthful sibling progress keeps all three alive inside their silence budgets', () => {
	const environment = createEssentialTestEnvironment();
	activateSiblings(environment);
	environment.advance(25000);
	updateMitzvahWorldEssentialMilestone(environment, RENDERER, { importerStage: 'webgl-boot-frame' });
	updateMitzvahWorldEssentialMilestone(environment, TERRAIN, { importerStage: 'bootstrap-world-foundation' });
	updateMitzvahWorldEssentialMilestone(environment, CHOSSID, { importerStage: 'canonical-validation' });
	environment.advance(29999);
	environment.fireTimeout();
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.stalledMilestone, null);
	assert.equal(snapshot.milestones[RENDERER].status, 'pending');
	assert.equal(snapshot.milestones[TERRAIN].status, 'pending');
	assert.equal(snapshot.milestones[CHOSSID].status, 'pending');
});

test('hard first-play horizon cannot be extended forever by progress', () => {
	const environment = createEssentialTestEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	for (const time of [20000, 40000, 60000, 80000]) {
		environment.advance(time - environment.performance.now());
		updateMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, { importerStage: `entry-${time}` });
	}
	environment.advance(10000);
	environment.fireTimeout();
	const stalled = getMitzvahWorldEssentialBootSnapshot(environment).stalledMilestone;
	assert.equal(stalled.name, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	assert.equal(stalled.failureCode, 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT');
});

test('timeout preserves the most recent importer evidence', () => {
	const environment = createEssentialTestEnvironment();
	activateSiblings(environment);
	updateMitzvahWorldEssentialMilestone(environment, RENDERER, {
		importerStage: 'webgl-boot-frame',
		resourceStatus: 200,
		resourceUrl: '/renderer/bootstrap'
	});
	updateMitzvahWorldEssentialMilestone(environment, TERRAIN, { importerStage: 'terrain-alive' });
	updateMitzvahWorldEssentialMilestone(environment, CHOSSID, { importerStage: 'chossid-alive' });
	environment.advance(30001);
	environment.fireTimeout();
	const stalled = getMitzvahWorldEssentialBootSnapshot(environment).stalledMilestone;
	assert.equal(stalled.name, RENDERER);
	assert.equal(stalled.importerStage, 'webgl-boot-frame');
	assert.equal(stalled.resourceUrl, '/renderer/bootstrap');
	assert.equal(stalled.resourceStatus, 200);
});
