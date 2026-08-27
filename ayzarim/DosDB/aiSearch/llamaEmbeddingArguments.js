// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file llamaEmbeddingArguments.js
 * @chapter The Measured Vessel Guards The Embedding Light
 * @description
 * The Awtsmoos binds context, batch, pooling, and JSON into one clear command array;
 * Awtsmoos.com keeps every BGE invocation within the model's trained prayer.
 */

const DEFAULT_CONTEXT_SIZE = 512;

function contextSize(provider = {}, options = {}) {
	return Number(
		options.contextSize
		|| provider.contextSize
		|| provider.maxTokens
		|| DEFAULT_CONTEXT_SIZE
	);
}

function embeddingArguments(readiness, text, options = {}) {
	const context = contextSize(readiness.provider, options);
	return [
		'-m', readiness.modelPath,
		'-p', String(text || ''),
		'--ctx-size', String(context),
		'--batch-size', String(context),
		'--ubatch-size', String(context),
		'--pooling', readiness.provider.pooling || 'cls',
		'--embd-normalize', '2',
		'--embd-output-format', 'json'
	];
}

module.exports = {
	DEFAULT_CONTEXT_SIZE,
	contextSize,
	embeddingArguments
};
