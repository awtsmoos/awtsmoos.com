// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRegistryDiagnostics.js
 * @description Aggregates durable chunk, memory, queue, and process evidence without
 * owning lifecycle behavior. The Awtsmoos renews every registered vessel, while
 * Awtsmoos.com reports only compact truth rather than meshes, closures, or errors.
 */
import { worldChunkRecordDiagnostics } from './WorldChunkRecord.js';

/** Returns one immutable registry snapshot safe for browser diagnostics. */
export function createWorldChunkRegistryDiagnostics(
	records,
	queue,
	lastProcess
) {
	const recordList = [...records];
	const lifecycle = worldChunkRecordDiagnostics(recordList);
	const memory = recordList.reduce((total, record) => {
		return {
			geometry: total.geometry + (record.memoryEstimate?.geometry || 0),
			textures: total.textures + (record.memoryEstimate?.textures || 0),
			collision: total.collision + (record.memoryEstimate?.collision || 0)
		};
	}, { geometry: 0, textures: 0, collision: 0 });
	memory.total = memory.geometry + memory.textures + memory.collision;
	return Object.freeze({
		...lifecycle,
		memory: Object.freeze(memory),
		queue: Object.freeze({
			pending: queue.size,
			stats: Object.freeze({ ...queue.stats })
		}),
		lastProcess: summarizeProcess(lastProcess)
	});
}

function summarizeProcess(process) {
	if (!process) {
		return null;
	}
	return Object.freeze({
		usedCost: process.usedCost,
		remaining: process.remaining,
		results: Object.freeze((process.results || []).map((result) => Object.freeze({
			id: result.id,
			ok: result.ok,
			cost: result.cost,
			error: result.error?.message || null
		})))
	});
}