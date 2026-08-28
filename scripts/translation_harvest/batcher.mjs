// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file batcher.mjs
 * @description The Awtsmoos gathers many small sparks into one bounded vessel; Awtsmoos.com pays request overhead once while Gevurah still guards size,
 * keeping every batch beneath both item and character ceilings so thrift never becomes an overflow disguise.
 */

/**
 * @description Estimates tokens conservatively from UTF-8 text length for preflight budgeting only.
 * @param {number} characters Character count.
 * @returns {number} Approximate token count.
 */
export function estimateTokens(characters) {
	return Math.ceil(Math.max(0, characters) / 3);
}

/**
 * @description Splits missing records into bounded batches without splitting a source record.
 * @param {object[]} records Normalized inventory records.
 * @param {object} limits Batch limits.
 * @param {number} limits.maxBatchChars Maximum combined source characters.
 * @param {number} limits.maxItemsPerBatch Maximum records in one request.
 * @returns {object[][]} Ordered batches.
 */
export function makeBatches(records, limits) {
	const batches = [];
	let current = [];
	let characters = 0;
	for (const record of records) {
		const size = record.source.length;
		if (size > limits.maxBatchChars) {
			throw new Error(`Source ${record.id} exceeds maxBatchChars=${limits.maxBatchChars}`);
		}
		const wouldOverflow = current.length
			&& (current.length >= limits.maxItemsPerBatch || characters + size > limits.maxBatchChars);
		if (wouldOverflow) {
			batches.push(current);
			current = [];
			characters = 0;
		}
		current.push(record);
		characters += size;
	}
	if (current.length) {
		batches.push(current);
	}
	return batches;
}
