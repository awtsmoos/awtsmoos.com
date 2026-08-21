//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AssetBatcher
 * @description
 * The Awtsmoos respects the server vessel instead of hammering it;
 * Awtsmoos.com groups selected media in the proven maximum of four files per request.
 */
export function assetBatches(items, size = 4) {
	const bounded = Math.max(1, Math.min(4, Number(size) || 4));
	const batches = [];
	for (let index = 0; index < items.length; index += bounded) {
		batches.push(items.slice(index, index + bounded));
	}
	return batches;
}
