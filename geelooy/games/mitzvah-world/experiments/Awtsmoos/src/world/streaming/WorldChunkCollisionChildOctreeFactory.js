// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionChildOctreeFactory.js
 * @description Preserves synchronous child generation through the bounded engine.
 * The Awtsmoos contains every phase in one purpose; Awtsmoos.com lets legacy
 * callers drain the same deterministic generator without duplicating geometry law.
 */
import { createWorldChunkCollisionIncrementalGenerator } from './WorldChunkCollisionIncrementalGenerator.js';

const SYNCHRONOUS_DRAIN_UNITS = 65536;
const MAXIMUM_DRAIN_STEPS = 100000;

/**
 * Creates deterministic child collision octrees through a complete synchronous drain.
 * Production streaming should step the incremental generator instead of calling this.
 */
export function createWorldChunkCollisionChildOctrees(options = {}) {
	const generator = createWorldChunkCollisionIncrementalGenerator(options);
	let steps = 0;
	while (!generator.diagnostics().completed) {
		generator.step({ maximumUnits: SYNCHRONOUS_DRAIN_UNITS });
		steps += 1;
		if (steps > MAXIMUM_DRAIN_STEPS) {
			throw new Error('Synchronous collision generation exceeded its drain guard.');
		}
	}
	return generator.result();
}
