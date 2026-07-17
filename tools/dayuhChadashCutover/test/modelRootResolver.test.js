// B"H
// Boruch Hashem
// Blessed is He

/** @file modelRootResolver.test.js @description Proves portable AI resolution. */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
	resolveLlamaBinary,
	resolveModelRoot
} = require('../../../ayzarim/DosDB/aiSearch/modelRootResolver.js');

test('explicit and environment model roots preserve strict precedence', () => {
	assert.equal(resolveModelRoot({ modelRoot: '/explicit/rag' }), '/explicit/rag');
	assert.equal(resolveModelRoot({
		environment: { AWTSMOOS_EMBED_MODEL_ROOT: '/embed/rag' }
	}), '/embed/rag');
	assert.equal(resolveModelRoot({
		environment: { AWTSMOOS_RAG_ROOT: '/runtime/rag' }
	}), '/runtime/rag');
	assert.equal(resolveModelRoot({
		environment: { AWTSMOOS_AI_ROOT: '/runtime/ai' }
	}), '/runtime/ai/comment-rag');
});

test('portable cwd fallback contains no operator home path', () => {
	const root = resolveModelRoot({ environment: {}, cwd: '/service' });
	assert.equal(root, '/service/.awtsmoos/ai/comment-rag');
	assert.equal(root.includes('/Users/'), false);
});

test('compact runner wins over the legacy development checkout', () => {
	const compact = path.resolve('/runtime/rag/runtime/llama/bin/llama-embedding');
	const legacy = path.resolve(
		'/runtime/rag/embedder-lab/llama.cpp/build/bin/llama-embedding'
	);
	const found = new Set([compact, legacy]);
	assert.equal(resolveLlamaBinary({
		modelRoot: '/runtime/rag',
		existsSync: candidate => found.has(candidate),
		environment: {}
	}), compact);
});

test('legacy runner remains available before the cutover', () => {
	const legacy = path.resolve(
		'/canonical/rag/embedder-lab/llama.cpp/build/bin/llama-embedding'
	);
	assert.equal(resolveLlamaBinary({
		modelRoot: '/canonical/rag',
		existsSync: candidate => candidate === legacy,
		environment: {}
	}), legacy);
});
