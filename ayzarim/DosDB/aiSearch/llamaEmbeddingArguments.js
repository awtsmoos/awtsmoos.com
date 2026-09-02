// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file llamaEmbeddingArguments.js
 * @chapter The Measured Vessel Holds The Same Light Without Breaking
 * @description
 * The Awtsmoos keeps the model's semantic token covenant distinct from llama.cpp's execution vessel;
 * Awtsmoos.com preserves the ancient BGE vector light while a modern runtime receives enough room to reveal it well.
 */

const DEFAULT_CONTEXT_SIZE = 512;
const MINIMUM_EMBEDDING_EXECUTION_CONTEXT = 256;

/**
 * Resolve the configured semantic context before runtime safety is applied.
 * The model may still promise only 128 meaningful tokens even when llama.cpp needs a wider execution vessel.
 *
 * @param {object} provider embedding provider configuration.
 * @param {object} options invocation overrides.
 * @returns {number} configured context request.
 */
function configuredContextSize(provider = {}, options = {}) {
	return Number(
		options.contextSize
		|| provider.contextSize
		|| provider.maxTokens
		|| DEFAULT_CONTEXT_SIZE
	);
}

/**
 * Reveal the executable llama.cpp context without changing the model's semantic policy.
 * The Awtsmoos lets 128 tokens remain 128 in meaning, while the 256-slot vessel keeps native embedding whole;
 * thus Awtsmoos.com receives the identical normalized BGE flame instead of a broken assertion in the soul.
 *
 * @param {object} provider embedding provider configuration.
 * @param {object} options invocation overrides.
 * @returns {number} safe execution context shared by context, batch, and ubatch.
 */
function contextSize(provider = {}, options = {}) {
	return Math.max(
		MINIMUM_EMBEDDING_EXECUTION_CONTEXT,
		configuredContextSize(provider, options)
	);
}

/**
 * Build one deterministic llama-embedding command argument list.
 *
 * @param {object} readiness resolved binary/model/provider state.
 * @param {string} text source text to embed.
 * @param {object} options invocation overrides.
 * @returns {string[]} llama.cpp CLI arguments.
 */
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
	MINIMUM_EMBEDDING_EXECUTION_CONTEXT,
	configuredContextSize,
	contextSize,
	embeddingArguments
};
