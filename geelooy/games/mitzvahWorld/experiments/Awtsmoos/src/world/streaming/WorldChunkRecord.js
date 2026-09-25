// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRecord.js
 * @description Creates immutable durable chunk records, safe serialization, compact
 * gameplay mutations, and lifecycle diagnostics. The Awtsmoos renews geometry beyond
 * any saved buffer; Awtsmoos.com preserves identity, evidence, and one compact layer
 * of world state rather than raw vertices.
 */
import {
	childWorldChunkIds,
	createWorldChunkId,
	parentWorldChunkId,
	parseWorldChunkId,
	worldChunkSeed
} from './WorldChunkId.js';
import {
	clampChunkUnit,
	freezeChunkBounds,
	freezeChunkMemory,
	freezeChunkMutations,
	freezeChunkReadiness,
	freezeChunkStrings,
	freezeCollisionHandoff,
	nonnegativeChunkInteger,
	nonnegativeChunkNumber
} from './WorldChunkRecordValues.js';
import {
	WORLD_CHUNK_STATES,
	assertWorldChunkState
} from './WorldChunkState.js';

/** Creates one immutable world-chunk metadata record. */
export function createWorldChunkRecord(definition = {}) {
	const id = definition.id || createWorldChunkId(definition.identity);
	parseWorldChunkId(id);
	const generationVersion = nonnegativeChunkInteger(
		'generationVersion',
		definition.generationVersion ?? 1,
		1
	);
	return Object.freeze({
		id,
		state: assertWorldChunkState(definition.state ?? WORLD_CHUNK_STATES.UNKNOWN),
		generationVersion,
		deterministicSeed: definition.deterministicSeed
			?? worldChunkSeed(id, generationVersion),
		bounds: freezeChunkBounds(definition.bounds),
		parentId: definition.parentId ?? parentWorldChunkId(id),
		childIds: freezeChunkStrings(definition.childIds ?? childWorldChunkIds(id)),
		neighborIds: freezeChunkStrings(definition.neighborIds),
		assetDependencies: freezeChunkStrings(definition.assetDependencies),
		memoryEstimate: freezeChunkMemory(definition.memoryEstimate),
		readiness: freezeChunkReadiness(definition.readiness),
		collisionRequired: definition.collisionRequired !== false,
		collisionHandoff: freezeCollisionHandoff(definition.collisionHandoff),
		streamingUrgency: clampChunkUnit(definition.streamingUrgency),
		durableMutations: freezeChunkMutations(definition.durableMutations),
		lastAccessTime: nonnegativeChunkNumber(
			'lastAccessTime',
			definition.lastAccessTime
		),
		lastTransition: definition.lastTransition ?? null,
		runtime: definition.runtime ?? null
	});
}

/**
 * Returns a new record carrying one compact gameplay mutation (door opened, item
 * collected) without mutating the frozen original. Mutations stay JSON-safe so
 * serializeWorldChunkRecord can carry them across unload and reload.
 */
export function applyWorldChunkMutation(record, key, value) {
	if (!record || typeof record.id !== 'string') {
		throw new TypeError('A world chunk record is required.');
	}
	if (typeof key !== 'string' || key.length === 0) {
		throw new TypeError('Mutation key must be a nonempty string.');
	}
	return createWorldChunkRecord({
		...record,
		durableMutations: { ...record.durableMutations, [key]: value }
	});
}

/** Reads one durable gameplay mutation from a chunk record. */
export function worldChunkMutation(record, key) {
	return record?.durableMutations?.[key] ?? null;
}

/** Serializes only reconstructable durable chunk metadata. */
export function serializeWorldChunkRecord(record) {
	const { runtime, ...durable } = record;
	return JSON.parse(JSON.stringify(durable));
}

/** Summarizes lifecycle and readiness across an iterable of chunk records. */
export function worldChunkRecordDiagnostics(records) {
	const byState = Object.fromEntries(
		Object.values(WORLD_CHUNK_STATES).map((state) => [state, 0])
	);
	const readiness = {
		visualReady: 0,
		collisionPrepared: 0,
		safetyValidated: 0,
		collisionOptional: 0
	};
	let total = 0;
	for (const record of records) {
		total += 1;
		byState[assertWorldChunkState(record.state)] += 1;
		readiness.visualReady += record.readiness?.visualReady === true ? 1 : 0;
		readiness.collisionPrepared += record.readiness?.collisionPrepared === true
			? 1
			: 0;
		readiness.safetyValidated += record.readiness?.safetyValidated === true
			? 1
			: 0;
		readiness.collisionOptional += record.collisionRequired === false ? 1 : 0;
	}
	return Object.freeze({
		total,
		byState: Object.freeze(byState),
		readiness: Object.freeze(readiness)
	});
}
