// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialBoot.test.js
 * @description Proves the five essential facts remain acyclic, fail closed, idempotent, and expose actionable evidence.
 * The Awtsmoos renews each measured instant while Awtsmoos.com makes every gate testify plainly;
 * no optional ornament may become a chain, and no hidden failure may disappear silently.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ESSENTIAL_MILESTONE_CATALOG } from './MitzvahWorldEssentialMilestoneCatalog.js';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	failMitzvahWorldEssentialMilestone,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot,
	restartMitzvahWorldEssentialBoot,
	updateMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';

const ORDER = [
	ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED,
	ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
	ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
	ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
	ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED
];

test('essential boot exposes exactly five facts and certifies only after all complete', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	assert.deepEqual(Object.keys(getMitzvahWorldEssentialBootSnapshot(environment).milestones), ORDER);
	for (const milestone of ORDER) {
		environment.advance(10);
		completeMitzvahWorldEssentialMilestone(environment, milestone);
	}
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.certified, true);
	assert.equal(snapshot.stalledMilestone, null);
});

test('essential milestone graph is exactly five facts and acyclic', () => {
	const names = ESSENTIAL_MILESTONE_CATALOG.map(definition => definition.name);
	assert.deepEqual(names, ORDER);
	const byName = new Map(ESSENTIAL_MILESTONE_CATALOG.map(definition => [definition.name, definition]));
	for (const definition of ESSENTIAL_MILESTONE_CATALOG) {
		for (const dependency of definition.dependencies) {
			assert.ok(byName.has(dependency), 'unknown dependency ' + dependency);
		}
	}
	const visiting = new Set();
	const visited = new Set();
	const visit = (name, trail) => {
		if (visiting.has(name)) {
			throw new Error('essential milestone cycle: ' + [...trail, name].join(' -> '));
		}
		if (visited.has(name)) {
			return;
		}
		visiting.add(name);
		for (const dependency of byName.get(name).dependencies) {
			visit(dependency, [...trail, name]);
		}
		visiting.delete(name);
		visited.add(name);
	};
	for (const name of names) {
		visit(name, []);
	}
});

test('terrain and renderer never wait for the Chossid; movement waits for all three', () => {
	const byName = new Map(ESSENTIAL_MILESTONE_CATALOG.map(definition => [definition.name, definition]));
	const renderer = byName.get(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME).dependencies;
	const terrain = byName.get(ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS).dependencies;
	const chossid = byName.get(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED).dependencies;
	const movement = byName.get(ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED).dependencies;
	assert.deepEqual([...renderer], [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]);
	assert.deepEqual([...terrain], [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]);
	assert.deepEqual([...chossid], [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]);
	assert.ok(!renderer.includes(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED));
	assert.ok(!terrain.includes(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED));
	assert.deepEqual([...movement].sort(), [
		ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
		ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
		ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED
	].sort());
});

test('movement cannot complete before renderer terrain and canonical Chossid', () => {
	const environment = fakeEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	const snapshot = completeMitzvahWorldEssentialMilestone(
		environment,
		ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED
	);
	assert.equal(snapshot.certified, false);
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_DEPENDENCY_INCOMPLETE');
});

test('duplicate completion is idempotent and keeps the first evidence', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	environment.advance(100);
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, { importerStage: 'first' });
	environment.advance(50);
	const snapshot = completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, { importerStage: 'second' });
	const milestone = snapshot.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED];
	assert.equal(milestone.status, 'complete');
	assert.equal(milestone.elapsedMilliseconds, 100);
	assert.equal(milestone.importerStage, 'first');
});

test('terminal states are immutable once witnessed', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	const afterFail = failMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, { failureCode: 'LATE' });
	assert.equal(afterFail.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED].status, 'complete');
	assert.equal(afterFail.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED].failureCode, null);
	const failing = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(failing);
	failMitzvahWorldEssentialMilestone(failing, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, { failureCode: 'BOOM' });
	const afterComplete = completeMitzvahWorldEssentialMilestone(failing, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	assert.equal(afterComplete.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED].status, 'failed');
	assert.equal(afterComplete.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED].failureCode, 'BOOM');
});

test('snapshots are frozen and cannot mutate ledger truth', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	const first = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.ok(Object.isFrozen(first));
	assert.ok(Object.isFrozen(first.milestones));
	assert.throws(() => { first.certified = true; }, TypeError);
	const second = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(second.certified, false);
	assert.notEqual(first, second);
});

test('optional work cannot poison essential readiness; unknown facts are rejected', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	assert.throws(() => completeMitzvahWorldEssentialMilestone(environment, 'optionalTextureStream'), /Unknown essential/);
	assert.throws(() => failMitzvahWorldEssentialMilestone(environment, 'optionalWildlife'), /Unknown essential/);
	assert.throws(() => updateMitzvahWorldEssentialMilestone(environment, 'optionalQuest'), /Unknown essential/);
	for (const milestone of ORDER) {
		environment.advance(5);
		completeMitzvahWorldEssentialMilestone(environment, milestone);
	}
	assert.equal(getMitzvahWorldEssentialBootSnapshot(environment).certified, true);
});

test('five-second watchdog names the first actionable unresolved milestone', () => {
	const environment = fakeEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	environment.advance(5001);
	environment.fireTimeout();
	const stalled = getMitzvahWorldEssentialBootSnapshot(environment).stalledMilestone;
	assert.equal(stalled.name, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME);
	assert.equal(stalled.status, 'timed-out');
	assert.equal(stalled.failureCode, 'ESSENTIAL_RENDERER_FIRST_FRAME_TIMEOUT');
	assert.ok(stalled.elapsedMilliseconds >= 5000);
});

test('watchdog timer is cleared once every fact reaches a terminal state', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	assert.equal(environment.clearedCount, 0);
	for (const milestone of ORDER) {
		environment.advance(5);
		completeMitzvahWorldEssentialMilestone(environment, milestone);
	}
	assert.ok(environment.clearedCount >= 1);
	assert.equal(environment.timeoutCallback, null);
});

test('essential resource failure retains URL status elapsed time and importer stage', () => {
	const environment = fakeEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	environment.advance(125);
	const snapshot = failMitzvahWorldEssentialMilestone(
		environment,
		ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
		{
			failureCode: 'CANONICAL_CHOSSID_GLB_LOAD_FAILED',
			importerStage: 'gltf-fetch-decode',
			resourceStatus: 404,
			resourceUrl: '/assets/player/chossid.glb'
		}
	);
	const stalled = snapshot.stalledMilestone;
	assert.equal(stalled.resourceStatus, 404);
	assert.equal(stalled.importerStage, 'gltf-fetch-decode');
	assert.equal(stalled.resourceUrl, '/assets/player/chossid.glb');
	assert.equal(stalled.elapsedMilliseconds, 125);
});

test('boot publishes the immutable global receipt on the environment', () => {
	const environment = fakeEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	const receipt = environment.AwtsmoosMitzvahWorldEssentialBoot;
	assert.ok(receipt);
	assert.equal(receipt.certified, false);
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	assert.notEqual(environment.AwtsmoosMitzvahWorldEssentialBoot, receipt);
	assert.equal(environment.AwtsmoosMitzvahWorldEssentialBoot.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED].status, 'complete');
});

test('world-launch restart opens a fresh bounded gate and preserves entry evidence', () => {
	const environment = fakeEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, {
		importerStage: 'compact-entry-body',
		resourceUrl: './experiments/Awtsmoos/src/mitzvah-world.compact.js'
	});
	environment.advance(30000);
	environment.fireTimeout();
	const stale = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(stale.stalledMilestone.name, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME);
	assert.equal(stale.certified, false);
	const restarted = restartMitzvahWorldEssentialBoot(environment);
	assert.equal(restarted.stalledMilestone, null);
	assert.equal(restarted.certified, false);
	const entry = restarted.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED];
	assert.equal(entry.status, 'complete');
	assert.equal(entry.importerStage, 'compact-entry-body');
	assert.equal(entry.resourceUrl, './experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.equal(restarted.milestones[ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME].status, 'pending');
	for (const milestone of ORDER.slice(1)) {
		environment.advance(10);
		completeMitzvahWorldEssentialMilestone(environment, milestone);
	}
	assert.equal(getMitzvahWorldEssentialBootSnapshot(environment).certified, true);
});

test('restart disarms the stale watchdog and dismisses the presented failure', () => {
	const environment = fakeEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	const clearedBefore = environment.clearedCount;
	let removed = false;
	environment.document = { getElementById: () => ({ remove() { removed = true; } }) };
	restartMitzvahWorldEssentialBoot(environment);
	assert.ok(environment.clearedCount > clearedBefore, 'stale watchdog disarmed');
	assert.equal(removed, true, 'presented menu-idle failure dismissed');
});

test('restart without a previous ledger still witnesses entry and arms a fresh gate', () => {
	const environment = fakeEnvironment();
	const snapshot = restartMitzvahWorldEssentialBoot(environment);
	assert.equal(snapshot.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED].status, 'complete');
	assert.equal(snapshot.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED].importerStage, 'world-launch-restart');
	assert.equal(snapshot.stalledMilestone, null);
	assert.equal(snapshot.certified, false);
});

function fakeEnvironment() {
	let currentTime = 0;
	const state = {
		clearedCount: 0,
		timeoutCallback: null,
		advance(milliseconds) {
			currentTime += milliseconds;
		},
		clearTimeout() {
			state.clearedCount += 1;
			state.timeoutCallback = null;
		},
		fireTimeout() {
			state.timeoutCallback?.();
		},
		performance: {
			now() {
				return currentTime;
			}
		},
		setTimeout(callback) {
			state.timeoutCallback = callback;
			return { unref() {} };
		},
	};
	return state;
}
