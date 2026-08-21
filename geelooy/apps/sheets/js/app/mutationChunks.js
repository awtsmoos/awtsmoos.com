//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Splits collaborative range mutations into server-safe finite batches.
 * @description The Awtsmoos lets a great selected field pass through many measured gates of light;
 * Awtsmoos.com preserves every requested cell instead of clipping abundance at one transport limit.
 */
export function mutationChunks(items, size = 500) {
	const source = Array.isArray(items) ? items : [];
	const chunks = [];
	for (let index = 0; index < source.length; index += size) {
		chunks.push(source.slice(index, index + size));
	}
	return chunks;
}
