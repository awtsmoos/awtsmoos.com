// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkSafety.test.mjs
 * @description Proves activation cannot outrun visuals, collision, dependencies, or
 * parent handoff while the Awtsmoos carries the player into newly revealed terrain.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { WORLD_CHUNK_STATES as S } from '../../world/streaming/WorldChunkState.js';
import {
	canActivateWorldChunk,
	evaluateWorldChunkSafety
} from '../../world/streaming/WorldChunkSafety.js';

function safeRecord(overrides = {}) {
	return {
		readiness: {
			visualReady: true,
			collisionPrepared: true,
			safetyValidated: true
		},
		collisionRequired: true,
		assetDependencies: [],
		parentId: null,
		collisionHandoff: {},
		...overrides
	};
}

test('fully prepared root chunks may activate', () => {
	const assessment = evaluateWorldChunkSafety(safeRecord());
	assert.equal(assessment.safe, true);
	assert.equal(canActivateWorldChunk(safeRecord()), true);
});

test('collision-optional horizon chunks do not fake collision readiness', () => {
	const record = safeRecord({
		collisionRequired: false,
		readiness: {
			visualReady: true,
			collisionPrepared: false,
			safetyValidated: true
		}
	});
	assert.equal(evaluateWorldChunkSafety(record).collisionReady, true);
	assert.equal(canActivateWorldChunk(record), true);
});

test('dependencies must be safety-ready', () => {
	const record = safeRecord({ assetDependencies: ['river-upstream'] });
	const blocked = evaluateWorldChunkSafety(record, new Map());
	assert.deepEqual(blocked.missingDependencies, ['river-upstream']);
	const dependencies = new Map([
		['river-upstream', { id: 'river-upstream', state: S.SAFETY_VALIDATED }]
	]);
	assert.equal(canActivateWorldChunk(record, dependencies), true);
});

test('child activation requires retained parent collision and atomic handoff', () => {
	const base = safeRecord({ parentId: 'parent' });
	assert.equal(canActivateWorldChunk(base), false);
	const retained = safeRecord({
		parentId: 'parent',
		collisionHandoff: { parentRetained: true, atomicReady: false }
	});
	assert.equal(canActivateWorldChunk(retained), false);
	const ready = safeRecord({
		parentId: 'parent',
		collisionHandoff: { parentRetained: true, atomicReady: true }
	});
	assert.equal(canActivateWorldChunk(ready), true);
});