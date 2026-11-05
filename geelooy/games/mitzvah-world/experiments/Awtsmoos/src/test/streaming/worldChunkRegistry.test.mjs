// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkRegistry.test.mjs
 * @description Proves bounded scheduling, legal transitions, safety, lookup, and
 * diagnostics before Awtsmoos.com entrusts real streamed vessels to the registry.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorldChunkId } from '../../world/streaming/WorldChunkId.js';
import { WorldChunkRegistry } from '../../world/streaming/WorldChunkRegistry.js';
import { WORLD_CHUNK_STATES as S } from '../../world/streaming/WorldChunkState.js';

function definition(x, state = S.UNKNOWN, overrides = {}) {
	return {
		id: createWorldChunkId({ namespace: 'registry-test', x }),
		state,
		bounds: {
			min: { x, y: 0, z: 0 },
			max: { x: x + 1, y: 1, z: 1 }
		},
		childIds: [],
		...overrides
	};
}

test('registry stores immutable records and rejects duplicates', () => {
	const registry = new WorldChunkRegistry();
	const chunk = definition(0);
	assert.equal(registry.register(chunk), true);
	assert.equal(registry.register(chunk), false);
	assert.equal(registry.size, 1);
	assert.equal(registry.has(chunk.id), true);
	assert.equal(registry.get(chunk.id)?.id, chunk.id);
	assert.equal([...registry.values()].length, 1);
});

test('priority and transition limits use the existing bounded queue', () => {
	const registry = new WorldChunkRegistry();
	const low = definition(1);
	const high = definition(2);
	registry.register(low);
	registry.register(high);
	registry.queueTransition({
		id: low.id,
		toState: S.METADATA_LOADED,
		priority: 1
	});
	registry.queueTransition({
		id: high.id,
		toState: S.METADATA_LOADED,
		priority: 10
	});
	const first = registry.process({ maximumTransitions: 1, maximumCost: 4 });
	assert.equal(first.results[0].id, `world-chunk:${high.id}`);
	assert.equal(registry.get(high.id).state, S.METADATA_LOADED);
	assert.equal(registry.get(low.id).state, S.UNKNOWN);
	assert.equal(first.remaining, 1);
});

test('unsafe activation fails inside the queue without mutating state', () => {
	const registry = new WorldChunkRegistry();
	const dormant = definition(3, S.DORMANT, {
		readiness: {
			visualReady: false,
			collisionPrepared: false,
			safetyValidated: false
		}
	});
	registry.register(dormant);
	registry.queueTransition({ id: dormant.id, toState: S.ACTIVE });
	const result = registry.process();
	assert.equal(result.results[0].ok, false);
	assert.match(result.results[0].error.message, /not safe to activate/);
	assert.equal(registry.get(dormant.id).state, S.DORMANT);
});

test('registry diagnostics include lifecycle, memory, queue, and process truth', () => {
	const registry = new WorldChunkRegistry();
	registry.register(definition(4, S.ACTIVE, {
		memoryEstimate: { geometry: 10, textures: 20, collision: 30 },
		readiness: {
			visualReady: true,
			collisionPrepared: true,
			safetyValidated: true
		}
	}));
	registry.process();
	const diagnostics = registry.diagnostics();
	assert.equal(diagnostics.total, 1);
	assert.equal(diagnostics.byState[S.ACTIVE], 1);
	assert.deepEqual(diagnostics.memory, {
		geometry: 10,
		textures: 20,
		collision: 30,
		total: 60
	});
	assert.equal(diagnostics.queue.pending, 0);
	assert.equal(diagnostics.lastProcess.remaining, 0);
});