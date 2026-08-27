// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkRecord.test.mjs
 * @description Proves durable chunk metadata is immutable, serializable, and free
 * of runtime geometry while Awtsmoos.com reconstructs each vessel from stable truth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createWorldChunkRecord,
	serializeWorldChunkRecord,
	worldChunkRecordDiagnostics
} from '../../world/streaming/WorldChunkRecord.js';
import { WORLD_CHUNK_STATES as S } from '../../world/streaming/WorldChunkState.js';

test('chunk records freeze durable identity and value objects', () => {
	const record = createWorldChunkRecord({
		identity: { namespace: 'village', level: 2, x: 1, y: 0, z: -2 },
		bounds: {
			min: { x: 0, y: -5, z: 10 },
			max: { x: 64, y: 40, z: 74 }
		},
		neighborIds: ['north'],
		memoryEstimate: { geometry: 100, textures: 200, collision: 50 }
	});
	assert.equal(Object.isFrozen(record), true);
	assert.equal(Object.isFrozen(record.bounds), true);
	assert.equal(Object.isFrozen(record.bounds.min), true);
	assert.equal(Object.isFrozen(record.neighborIds), true);
	assert.equal(record.childIds.length, 8);
	assert.equal(Number.isSafeInteger(record.deterministicSeed), true);
});

test('serialization excludes runtime-only objects', () => {
	const runtime = {
		mesh: { vertices: new Float32Array([1, 2, 3]) },
		promise: Promise.resolve()
	};
	const record = createWorldChunkRecord({ runtime });
	const serialized = serializeWorldChunkRecord(record);
	assert.equal('runtime' in serialized, false);
	assert.equal(serialized.id, record.id);
	assert.equal(serialized.deterministicSeed, record.deterministicSeed);
});

test('diagnostics count lifecycle and readiness', () => {
	const records = [
		createWorldChunkRecord({ state: S.UNKNOWN }),
		createWorldChunkRecord({
			identity: { x: 1 },
			state: S.ACTIVE,
			collisionRequired: false,
			readiness: {
				visualReady: true,
				collisionPrepared: false,
				safetyValidated: true
			}
		})
	];
	const diagnostics = worldChunkRecordDiagnostics(records);
	assert.equal(diagnostics.total, 2);
	assert.equal(diagnostics.byState[S.UNKNOWN], 1);
	assert.equal(diagnostics.byState[S.ACTIVE], 1);
	assert.equal(diagnostics.readiness.visualReady, 1);
	assert.equal(diagnostics.readiness.safetyValidated, 1);
	assert.equal(diagnostics.readiness.collisionOptional, 1);
});

test('invalid bounds and memory estimates are rejected', () => {
	assert.throws(
		() => createWorldChunkRecord({
			bounds: { min: { x: 10 }, max: { x: 0 } }
		}),
		/max.x/
	);
	assert.throws(
		() => createWorldChunkRecord({ memoryEstimate: { geometry: -1 } }),
		/nonnegative/
	);
});