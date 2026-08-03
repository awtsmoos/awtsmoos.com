// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file llamaEmbeddingRunner.js
 * @chapter One Text Enters The Llama Gate And One Normalized Flame Returns
 * @description
 * The Awtsmoos sends one bounded BGE request through a proven local runner;
 * Awtsmoos.com receives a normalized vector without exceeding the model vessel.
 */

const childProcess = require('child_process');
const fs = require('fs');
const {
	getDefaultEmbedderConfig,
	resolveEmbedderModelPath
} = require('./embedderConfig.js');
const {
	resolveLlamaBinary,
	resolveModelRoot
} = require('./modelRootResolver.js');
const {
	embeddingArguments
} = require('./llamaEmbeddingArguments.js');
const {
	parseRawEmbedding
} = require('./llamaEmbeddingParser.js');

function llamaReadiness(options = {}) {
	const provider = options.provider || getDefaultEmbedderConfig();
	const root = resolveModelRoot(options);
	const modelPath = options.modelPath || resolveEmbedderModelPath(root, provider);
	const llamaBinary = resolveLlamaBinary({ ...options, modelRoot: root });
	return {
		ok: fs.existsSync(modelPath) && fs.existsSync(llamaBinary || ''),
		root,
		modelPath,
		llamaBinary,
		provider
	};
}

function embedTextWithLlama(text, options = {}) {
	const readiness = llamaReadiness(options);
	if (!readiness.ok) throw notReady(readiness);
	const dimensions = Number(
		readiness.provider.embeddingDimensions
		|| readiness.provider.dimensions
		|| 384
	);
	const result = childProcess.spawnSync(
		readiness.llamaBinary,
		embeddingArguments(readiness, text, options),
		{
			encoding: 'utf8',
			maxBuffer: options.maxBuffer || 128 * 1024 * 1024,
			timeout: options.timeoutMs || 120000
		}
	);
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(
			result.stderr || `B"H llama-embedding exited ${result.status}`
		);
	}
	const parsed = parseRawEmbedding(result.stdout, dimensions);
	return {
		success: true,
		realEmbedding: true,
		vector: parsed.vector,
		provider: 'llama-embedding:bge-small-en-v1.5-q8_0',
		state: {
			...readiness,
			parseMode: parsed.parseMode
		},
		cached: false
	};
}

function notReady(readiness) {
	const error = new Error('B"H llama embedder is not ready');
	error.code = 'LLAMA_EMBEDDER_NOT_READY';
	error.readiness = readiness;
	return error;
}

module.exports = {
	embedTextWithLlama,
	llamaReadiness,
	resolveLlamaBinary,
	resolveModelRoot
};
