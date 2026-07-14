// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file llamaEmbeddingRunner.js
 * @chapter One Text Enters The Llama Gate And One Normalized Flame Returns
 * @description
 * Executes one real llama.cpp embedding request. Root and binary precedence live
 * in a separate lazy resolver so isolated callers never probe production paths.
 */

const childProcess = require('child_process');
const fs = require('fs');
const { getDefaultEmbedderConfig, resolveEmbedderModelPath } = require('./embedderConfig.js');
const { resolveLlamaBinary, resolveModelRoot } = require('./modelRootResolver.js');

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

function normalize(vector) {
	const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
	return vector.map(value => Number((value / magnitude).toFixed(7)));
}

function parseRawEmbedding(raw, dimensions = 384) {
	const numbers = String(raw || '').trim().split(/\s+/).map(Number).filter(Number.isFinite);
	if (numbers.length === dimensions) {
		return { vector: normalize(numbers), parseMode: `single-${dimensions}` };
	}
	if (numbers.length > dimensions && numbers.length % dimensions === 0) {
		const rows = numbers.length / dimensions;
		const average = Array(dimensions).fill(0);
		for (let row = 0; row < rows; row++) {
			for (let index = 0; index < dimensions; index++) {
				average[index] += numbers[row * dimensions + index] / rows;
			}
		}
		return { vector: normalize(average), parseMode: `mean-${rows}x${dimensions}` };
	}
	throw new Error(`B"H llama raw embedding parse failed: expected ${dimensions} or ${dimensions}-wide rows, got ${numbers.length}`);
}

function embedTextWithLlama(text, options = {}) {
	const readiness = llamaReadiness(options);
	const dimensions = Number(readiness.provider.embeddingDimensions || readiness.provider.dimensions || 384);
	if (!readiness.ok) {
		const error = new Error('B"H llama embedder is not ready');
		error.code = 'LLAMA_EMBEDDER_NOT_READY';
		error.readiness = readiness;
		throw error;
	}
	const argumentsList = [
		'-m', readiness.modelPath,
		'-p', String(text || ''),
		'--pooling', readiness.provider.pooling || 'cls',
		'--embd-normalize', '2',
		'--embd-output-format', 'raw'
	];
	const result = childProcess.spawnSync(readiness.llamaBinary, argumentsList, {
		encoding: 'utf8',
		maxBuffer: options.maxBuffer || 128 * 1024 * 1024
	});
	if (result.status !== 0) {
		throw new Error(result.stderr || `B"H llama-embedding exited ${result.status}`);
	}
	const parsed = parseRawEmbedding(result.stdout, dimensions);
	return {
		success: true,
		realEmbedding: true,
		vector: parsed.vector,
		provider: 'llama-embedding:bge-small-en-v1.5-q8_0',
		state: { ...readiness, parseMode: parsed.parseMode },
		cached: false
	};
}

module.exports = {
	resolveModelRoot,
	resolveLlamaBinary,
	llamaReadiness,
	parseRawEmbedding,
	embedTextWithLlama
};
