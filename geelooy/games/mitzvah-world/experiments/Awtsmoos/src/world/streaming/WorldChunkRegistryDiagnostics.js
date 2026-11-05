// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRegistryDiagnostics.js
 * @description Aggregates durable chunk, memory, queue, and measured transition evidence without owning lifecycle behavior.
 * The Awtsmoos renews every registered vessel while each finite task receives its measured span;
 * Awtsmoos.com keeps the receipt compact, so release gates may judge real work without retaining meshes, closures, or the hand.
 */
import { worldChunkRecordDiagnostics } from './WorldChunkRecord.js';

/** Returns one immutable registry snapshot safe for browser diagnostics. */
export function createWorldChunkRegistryDiagnostics(records, queue, lastProcess) {
	const recordList = [...records];
	const lifecycle = worldChunkRecordDiagnostics(recordList);
	const memory = summarizeMemory(recordList);
	return Object.freeze({
		...lifecycle,
		memory,
		queue: Object.freeze({
			pending: queue.size,
			stats: Object.freeze({ ...queue.stats })
		}),
		lastProcess: summarizeProcess(lastProcess)
	});
}

/** Sums compact resource estimates without leaking render objects into diagnostics. */
function summarizeMemory(records) {
	const memory = records.reduce((total, record) => {
		return {
			geometry: total.geometry + (record.memoryEstimate?.geometry || 0),
			textures: total.textures + (record.memoryEstimate?.textures || 0),
			collision: total.collision + (record.memoryEstimate?.collision || 0)
		};
	}, { geometry: 0, textures: 0, collision: 0 });
	memory.total = memory.geometry + memory.textures + memory.collision;
	return Object.freeze(memory);
}

/** Preserves the scheduler's timing facts so a release cannot waive an unmeasured slice. */
function summarizeProcess(process) {
	if (!process) return null;
	return Object.freeze({
		budgetExhausted: process.budgetExhausted === true,
		elapsedMilliseconds: finiteOrNull(process.elapsedMilliseconds),
		longestTaskMilliseconds: finiteOrNull(process.longestTaskMilliseconds),
		overrunCount: Number.isFinite(process.overrunCount) ? process.overrunCount : 0,
		remaining: process.remaining,
		suspended: process.suspended === true,
		usedCost: process.usedCost,
		results: Object.freeze((process.results || []).map(result => Object.freeze({
			cost: result.cost,
			error: result.error?.message || null,
			id: result.id,
			ok: result.ok,
			taskMilliseconds: finiteOrNull(result.taskMilliseconds)
		})))
	});
}

function finiteOrNull(value) {
	return Number.isFinite(value) ? value : null;
}
