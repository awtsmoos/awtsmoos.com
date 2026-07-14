// B"H
// Boruch Hashem
// Blessed is He
/** @module VectorGeneration @description Records one addressable semantic index generation. */

/** Creates an immutable vector-generation record. */
export function createVectorGeneration(input) {
	const corpusId = String(input?.corpusId || '').trim();
	const generation = Number(input?.generation || 0);
	const rowCount = Number(input?.rowCount || 0);
	if (!corpusId || !Number.isInteger(generation) || generation < 1 || rowCount < 0) {
		throw new TypeError('Vector generation requires corpusId, positive generation, and rowCount.');
	}
	return Object.freeze({
		id: input?.id || `${corpusId}@${generation}`,
		corpusId,
		generation,
		rowCount,
		graphCount: Number(input?.graphCount ?? rowCount),
		dimensions: Number(input?.dimensions || 0),
		payloadHash: String(input?.payloadHash || ''),
		graphHash: String(input?.graphHash || ''),
		createdAt: String(input?.createdAt || new Date().toISOString()),
		state: input?.state || 'ready'
	});
}

/** Reports whether payload and graph counts agree. */
export function vectorGenerationHealthy(record) {
	return record?.state === 'ready' && record.rowCount === record.graphCount;
}
