// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialBoot.test.js
 * @description Proves the five essential facts remain acyclic, restartable, finite, and certifiable after the progress-watchdog rewrite.
 * The Awtsmoos gives five measured witnesses one shared Malchus; Awtsmoos.com proves their dependency order and restart truth without carrying obsolete stopwatch assumptions.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot,
	restartMitzvahWorldEssentialBoot
} from './MitzvahWorldEssentialBoot.js';
import { ESSENTIAL_MILESTONE_CATALOG } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { createEssentialTestEnvironment } from './MitzvahWorldEssentialTestEnvironment.js';

const ORDER = [
	ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED,
	ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
	ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
	ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
	ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED
];

test('catalog remains exactly five acyclic first-play facts', () => {
	assert.deepEqual(ESSENTIAL_MILESTONE_CATALOG.map(item => item.name), ORDER);
	const byName = new Map(ESSENTIAL_MILESTONE_CATALOG.map(item => [item.name, item]));
	for (const item of ESSENTIAL_MILESTONE_CATALOG) {
		for (const dependency of item.dependencies) assert.ok(byName.has(dependency));
	}
	assert.deepEqual(byName.get(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME).dependencies, [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]);
	assert.deepEqual(byName.get(ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS).dependencies, [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]);
	assert.deepEqual(byName.get(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED).dependencies, [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]);
	assert.equal(byName.get(ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED).dependencies.length, 3);
});

test('all five facts certify in dependency order and cancel the watchdog', () => {
	const environment = createEssentialTestEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	for (const milestone of ORDER) {
		environment.advance(100);
		completeMitzvahWorldEssentialMilestone(environment, milestone, { importerStage: `stage-${milestone}` });
	}
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.certified, true);
	assert.equal(snapshot.stalledMilestone, null);
	assert.equal(environment.activeTimer(), null);
});

test('movement fails closed until renderer terrain and Chossid are complete', () => {
	const environment = createEssentialTestEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	const snapshot = completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED);
	assert.equal(snapshot.certified, false);
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_DEPENDENCY_INCOMPLETE');
});

test('restart carries truthful entry evidence and replaces stale watchdog custody', () => {
	const environment = createEssentialTestEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, {
		importerStage: 'compact-entry-body',
		resourceUrl: './mitzvah-world.compact.js'
	});
	const timerBefore = environment.activeTimer();
	const restarted = restartMitzvahWorldEssentialBoot(environment);
	assert.notEqual(environment.activeTimer(), timerBefore);
	assert.equal(restarted.stalledMilestone, null);
	assert.equal(restarted.milestones.entryModuleExecuted.importerStage, 'compact-entry-body');
	assert.equal(restarted.milestones.entryModuleExecuted.resourceUrl, './mitzvah-world.compact.js');
	assert.equal(restarted.milestones.rendererFirstFrame.status, 'pending');
});
