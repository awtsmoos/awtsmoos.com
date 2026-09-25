// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialLiveSnapshot.test.js
 * @description Proves live snapshots expose the 30-second silence covenant, healthy sibling progress, and actionable true-stall evidence.
 * The Awtsmoos renews each witness that actually speaks; Awtsmoos.com therefore refreshes every healthy sibling explicitly,
 * while one silent fact remains visible instead of borrowing life from another subsystem's progress.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot,
	updateMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';
import { ESSENTIAL_BOOT_TIMEOUT_MS } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { createEssentialTestEnvironment } from './MitzvahWorldEssentialTestEnvironment.js';

const RENDERER = ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME;
const TERRAIN = ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS;
const CHOSSID = ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED;

function activateFirstPlaySiblings(environment) {
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
}

test('pending essential fact exposes live elapsed time and the current silence budget', () => {
	const environment = createEssentialTestEnvironment();
	activateFirstPlaySiblings(environment);
	environment.advance(1200);
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	const renderer = snapshot.milestones[RENDERER];
	assert.equal(renderer.status, 'pending');
	assert.equal(renderer.elapsedMilliseconds, 1200);
	assert.equal(renderer.timeoutMilliseconds, ESSENTIAL_BOOT_TIMEOUT_MS);
	assert.equal(renderer.timeoutMilliseconds, 30000);
	assert.equal(snapshot.stalledMilestone, null);
});

test('truthful progress for every active sibling keeps the live snapshot healthy', () => {
	const environment = createEssentialTestEnvironment();
	activateFirstPlaySiblings(environment);
	environment.advance(20000);
	updateMitzvahWorldEssentialMilestone(environment, RENDERER, {
		importerStage: 'webgl-boot-frame', resourceStatus: 200, resourceUrl: '/renderer/bootstrap'
	});
	updateMitzvahWorldEssentialMilestone(environment, TERRAIN, {
		importerStage: 'bootstrap-world-foundation', resourceStatus: 200, resourceUrl: '/terrain/bootstrap'
	});
	updateMitzvahWorldEssentialMilestone(environment, CHOSSID, {
		importerStage: 'canonical-validation', resourceStatus: 200, resourceUrl: '/chossid.glb'
	});
	environment.advance(15000);
	environment.fireTimeout();
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.stalledMilestone, null);
	assert.equal(snapshot.milestones[RENDERER].importerStage, 'webgl-boot-frame');
	assert.equal(snapshot.milestones[TERRAIN].importerStage, 'bootstrap-world-foundation');
	assert.equal(snapshot.milestones[CHOSSID].importerStage, 'canonical-validation');
});

test('watchdog converts true post-progress silence into actionable stalled evidence', () => {
	const environment = createEssentialTestEnvironment();
	activateFirstPlaySiblings(environment);
	updateMitzvahWorldEssentialMilestone(environment, RENDERER, {
		importerStage: 'webgl-boot-frame', resourceUrl: '/renderer/bootstrap'
	});
	updateMitzvahWorldEssentialMilestone(environment, TERRAIN, { importerStage: 'terrain-alive' });
	updateMitzvahWorldEssentialMilestone(environment, CHOSSID, { importerStage: 'chossid-alive' });
	environment.advance(30001);
	environment.fireTimeout();
	const stalled = getMitzvahWorldEssentialBootSnapshot(environment).stalledMilestone;
	assert.equal(stalled.name, RENDERER);
	assert.equal(stalled.failureCode, 'ESSENTIAL_RENDERER_FIRST_FRAME_TIMEOUT');
	assert.equal(stalled.importerStage, 'webgl-boot-frame');
	assert.equal(stalled.resourceUrl, '/renderer/bootstrap');
});
