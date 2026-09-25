// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialActivationTiming.test.js
 * @description Proves dependency clocks begin when facts become actionable and a genuinely silent Chossid blocks movement after the current 30-second silence budget.
 * The Awtsmoos gives each dependent fact its own beginning; Awtsmoos.com never charges movement for time before its witnesses exist,
 * yet a witness that remains silent beyond its measured night still fails closed with exact identity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot
} from './MitzvahWorldEssentialBoot.js';
import { createEssentialTestEnvironment } from './MitzvahWorldEssentialTestEnvironment.js';

const ENTRY = ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED;
const RENDERER = ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME;
const TERRAIN = ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS;
const CHOSSID = ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED;
const MOVEMENT = ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED;

test('movement clock begins only after its three dependencies complete', () => {
	const environment = createEssentialTestEnvironment();
	environment.advance(100);
	completeMitzvahWorldEssentialMilestone(environment, ENTRY);
	environment.advance(1200);
	completeMitzvahWorldEssentialMilestone(environment, RENDERER);
	environment.advance(800);
	completeMitzvahWorldEssentialMilestone(environment, TERRAIN);
	environment.advance(900);
	completeMitzvahWorldEssentialMilestone(environment, CHOSSID);
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[MOVEMENT].status, 'pending');
	assert.equal(snapshot.milestones[MOVEMENT].startedAtMilliseconds, environment.performance.now());
	assert.equal(snapshot.milestones[MOVEMENT].elapsedMilliseconds, 0);
});

test('late silent canonical Chossid is the stalled fact and movement never inherits its expired clock', () => {
	const environment = createEssentialTestEnvironment();
	environment.advance(100);
	completeMitzvahWorldEssentialMilestone(environment, ENTRY);
	environment.advance(1000);
	completeMitzvahWorldEssentialMilestone(environment, RENDERER);
	completeMitzvahWorldEssentialMilestone(environment, TERRAIN);
	environment.advance(29001);
	const snapshot = completeMitzvahWorldEssentialMilestone(environment, CHOSSID, {
		importerStage: 'canonical-validation'
	});
	assert.equal(snapshot.stalledMilestone.name, CHOSSID);
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_CANONICAL_CHOSSID_DECODED_TIMEOUT');
	assert.equal(snapshot.milestones[MOVEMENT].status, 'pending');
	assert.equal(snapshot.milestones[MOVEMENT].startedAtMilliseconds, null);
});
