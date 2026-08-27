// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRegistry.js
 * @description Owns durable chunk records and routes every lifecycle change through
 * the existing bounded LOD queue. The Awtsmoos renews each world vessel in order;
 * Awtsmoos.com rejects unsafe activation and invisible lifecycle shortcuts.
 */
import { LodTransitionQueue } from '../../lod/LodTransitionQueue.js';
import { canActivateWorldChunk } from './WorldChunkSafety.js';
import { createWorldChunkRecord } from './WorldChunkRecord.js';
import { createWorldChunkRegistryDiagnostics } from './WorldChunkRegistryDiagnostics.js';
import { WORLD_CHUNK_STATES } from './WorldChunkState.js';
import {
	canTransitionWorldChunk,
	transitionWorldChunk
} from './WorldChunkTransitions.js';

export class WorldChunkRegistry {
	constructor({ transitionQueue = new LodTransitionQueue() } = {}) {
		this.records = new Map();
		this.queue = transitionQueue;
		this.lastProcess = null;
	}

	get size() {
		return this.records.size;
	}

	register(definition) {
		const record = createWorldChunkRecord(definition);
		if (this.records.has(record.id)) {
			return false;
		}
		this.records.set(record.id, record);
		return true;
	}

	has(id) {
		return this.records.has(id);
	}

	get(id) {
		return this.records.get(id) || null;
	}

	values() {
		return this.records.values();
	}

	queueTransition({
		id,
		toState,
		evidence = {},
		priority = 0,
		cost = 1
	} = {}) {
		const current = this.requireRecord(id);
		this.assertLegalTransition(current, toState);
		return this.queue.enqueue({
			id: queueId(id),
			priority,
			cost,
			metadata: { chunkId: id, toState },
			apply: () => this.applyTransition(id, toState, evidence)
		});
	}

	process(options = {}) {
		this.lastProcess = this.queue.process(options);
		return this.lastProcess;
	}

	diagnostics() {
		return createWorldChunkRegistryDiagnostics(
			this.records.values(),
			this.queue,
			this.lastProcess
		);
	}

	applyTransition(id, toState, evidence) {
		const current = this.requireRecord(id);
		this.assertLegalTransition(current, toState);
		if (
			toState === WORLD_CHUNK_STATES.ACTIVE
			&& !canActivateWorldChunk(current, this.records)
		) {
			throw new Error(`World chunk is not safe to activate: ${id}`);
		}
		const next = transitionWorldChunk(current, toState, evidence);
		this.records.set(id, next);
		return next;
	}

	requireRecord(id) {
		const record = this.records.get(id);
		if (!record) {
			throw new Error(`Unknown world chunk: ${String(id)}`);
		}
		return record;
	}

	assertLegalTransition(record, toState) {
		if (!canTransitionWorldChunk(record.state, toState)) {
			throw new Error(
				`Illegal world chunk transition: ${record.state} -> ${toState}`
			);
		}
	}
}

function queueId(id) {
	return `world-chunk:${id}`;
}