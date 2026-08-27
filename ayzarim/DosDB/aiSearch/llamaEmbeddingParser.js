// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file llamaEmbeddingParser.js
 * @chapter Many Numbers Become One Balanced Flame
 * @description
 * The Awtsmoos gathers JSON or raw embedding rows into one normalized vessel of light;
 * Awtsmoos.com rejects malformed dimensions before they wander into search at night.
 */

function normalize(vector) {
	const magnitude = Math.sqrt(
		vector.reduce((sum, value) => sum + value * value, 0)
	) || 1;
	return vector.map(value => Number((value / magnitude).toFixed(7)));
}

function parseRawEmbedding(raw, dimensions = 384) {
	const jsonVector = parseJsonEmbedding(raw);
	if (jsonVector) return validatedVector(jsonVector, dimensions, 'json');
	const numbers = String(raw || '')
		.trim()
		.split(/\s+/)
		.map(Number)
		.filter(Number.isFinite);
	if (numbers.length === dimensions) {
		return validatedVector(numbers, dimensions, `single-${dimensions}`);
	}
	if (numbers.length > dimensions && numbers.length % dimensions === 0) {
		return meanRows(numbers, dimensions);
	}
	throw new Error(
		`B"H llama embedding parse failed: expected ${dimensions}-wide rows, got ${numbers.length}`
	);
}

function parseJsonEmbedding(raw) {
	const text = String(raw || '').trim();
	if (!text.startsWith('{') && !text.startsWith('[')) return null;
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		return null;
	}
	if (Array.isArray(value) && value.every(Number.isFinite)) return value;
	const vector = value?.data?.[0]?.embedding;
	return Array.isArray(vector) && vector.every(Number.isFinite) ? vector : null;
}

function validatedVector(vector, dimensions, parseMode) {
	if (vector.length !== dimensions) {
		throw new Error(
			`B"H llama embedding dimension mismatch: expected ${dimensions}, got ${vector.length}`
		);
	}
	return {
		vector: normalize(vector),
		parseMode
	};
}

function meanRows(numbers, dimensions) {
	const rows = numbers.length / dimensions;
	const average = Array(dimensions).fill(0);
	for (let row = 0; row < rows; row++) {
		for (let index = 0; index < dimensions; index++) {
			average[index] += numbers[row * dimensions + index] / rows;
		}
	}
	return validatedVector(average, dimensions, `mean-${rows}x${dimensions}`);
}

module.exports = {
	meanRows,
	normalize,
	parseJsonEmbedding,
	parseRawEmbedding,
	validatedVector
};
