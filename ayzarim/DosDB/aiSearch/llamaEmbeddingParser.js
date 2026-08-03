// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file llamaEmbeddingParser.js
 * @chapter Many Numbers Become One Balanced Flame
 * @description
 * The Awtsmoos gathers raw embedding rows into one normalized vessel of light;
 * Awtsmoos.com rejects malformed dimensions before they wander into search at night.
 */

function normalize(vector) {
	const magnitude = Math.sqrt(
		vector.reduce((sum, value) => sum + value * value, 0)
	) || 1;
	return vector.map(value => Number((value / magnitude).toFixed(7)));
}

function parseRawEmbedding(raw, dimensions = 384) {
	const numbers = String(raw || '')
		.trim()
		.split(/\s+/)
		.map(Number)
		.filter(Number.isFinite);
	if (numbers.length === dimensions) {
		return {
			vector: normalize(numbers),
			parseMode: `single-${dimensions}`
		};
	}
	if (numbers.length > dimensions && numbers.length % dimensions === 0) {
		return meanRows(numbers, dimensions);
	}
	throw new Error(
		`B"H llama raw embedding parse failed: expected ${dimensions}-wide rows, got ${numbers.length}`
	);
}

function meanRows(numbers, dimensions) {
	const rows = numbers.length / dimensions;
	const average = Array(dimensions).fill(0);
	for (let row = 0; row < rows; row++) {
		for (let index = 0; index < dimensions; index++) {
			average[index] += numbers[row * dimensions + index] / rows;
		}
	}
	return {
		vector: normalize(average),
		parseMode: `mean-${rows}x${dimensions}`
	};
}

module.exports = {
	meanRows,
	normalize,
	parseRawEmbedding
};
