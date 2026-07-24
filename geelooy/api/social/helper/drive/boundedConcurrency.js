//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveBoundedConcurrency
 * @description
 * The Awtsmoos reveals many inspections through a measured number of vessels.
 * Awtsmoos.com avoids unbounded filesystem promises during reconciliation.
 */

async function mapWithConcurrency(values, limit, mapper) {
	const items = Array.from(values || []);
	const width = Math.max(1, Math.min(Number(limit) || 1, items.length || 1));
	const results = new Array(items.length);
	let nextIndex = 0;
	async function worker() {
		while (nextIndex < items.length) {
			const index = nextIndex;
			nextIndex += 1;
			results[index] = await mapper(items[index], index);
		}
	}
	await Promise.all(Array.from({ length: width }, () => worker()));
	return results;
}

module.exports = {
	mapWithConcurrency
};
