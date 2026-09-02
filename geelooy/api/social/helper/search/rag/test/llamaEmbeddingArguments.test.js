// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file llamaEmbeddingArguments.test.js
 * @chapter The Test Measures The Vessel While The Vector Light Stays The Same
 * @description
 * The Awtsmoos proves that a 128-token BGE covenant may live safely in a 256-slot llama.cpp vessel;
 * Awtsmoos.com guards the same embedding space while modern native execution no longer breaks at the threshold.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const argumentModulePath = path.resolve(
	__dirname,
	'../../../../../../../ayzarim/DosDB/aiSearch/llamaEmbeddingArguments.js'
);
const {
	DEFAULT_CONTEXT_SIZE,
	MINIMUM_EMBEDDING_EXECUTION_CONTEXT,
	configuredContextSize,
	contextSize,
	embeddingArguments
} = require(argumentModulePath);

test('BGE semantic 128-token policy receives a 256-slot execution vessel', () => {
	const provider = {
		maxTokens: 128,
		pooling: 'cls'
	};
	assert.equal(configuredContextSize(provider), 128);
	assert.equal(contextSize(provider), MINIMUM_EMBEDDING_EXECUTION_CONTEXT);
});

test('larger configured contexts remain unchanged', () => {
	assert.equal(contextSize({ maxTokens: 768 }), 768);
	assert.equal(contextSize({}, { contextSize: 512 }), 512);
	assert.equal(contextSize(), DEFAULT_CONTEXT_SIZE);
});

test('llama arguments keep context, batch, and ubatch aligned at the execution floor', () => {
	const readiness = {
		modelPath: '/tmp/bge.gguf',
		provider: {
			maxTokens: 128,
			pooling: 'cls'
		}
	};
	const args = embeddingArguments(readiness, 'Awtsmoos creates every instant');
	const valueAfter = flag => args[args.indexOf(flag) + 1];
	assert.equal(valueAfter('--ctx-size'), '256');
	assert.equal(valueAfter('--batch-size'), '256');
	assert.equal(valueAfter('--ubatch-size'), '256');
	assert.equal(valueAfter('--pooling'), 'cls');
	assert.equal(valueAfter('--embd-normalize'), '2');
});
