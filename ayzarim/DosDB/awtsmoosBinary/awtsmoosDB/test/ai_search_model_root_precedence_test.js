// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/ai_search_model_root_precedence_test.js
 * @chapter The Isolated Root Must Prevent Even A Glance Toward Production
 * @description
 * Replaces existsSync with a sentinel that throws on the historical live path.
 * Explicit and environment roots must resolve without triggering that sentinel.
 */

const fs = require('fs');
const { resolveModelRoot } = require('../../../aiSearch/modelRootResolver.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const liveRoot = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
const originalExistsSync = fs.existsSync;
const originalEnvironmentRoot = process.env.AWTSMOOS_EMBED_MODEL_ROOT;
let livePathProbeCount = 0;

try {
	fs.existsSync = function guardedExistsSync(candidate) {
		if (String(candidate) === liveRoot) {
			livePathProbeCount++;
			throw new Error('B"H explicit model root probed the live default');
		}
		return originalExistsSync.call(fs, candidate);
	};

	const explicitRoot = '/tmp/awtsmoos-explicit-model-root';
	assert(resolveModelRoot({ modelRoot: explicitRoot }) === explicitRoot, 'explicit root was not preserved');
	assert(livePathProbeCount === 0, 'explicit root evaluated live fallback');

	process.env.AWTSMOOS_EMBED_MODEL_ROOT = '/tmp/awtsmoos-environment-model-root';
	assert(
		resolveModelRoot({}) === process.env.AWTSMOOS_EMBED_MODEL_ROOT,
		'environment root was not preserved'
	);
	assert(livePathProbeCount === 0, 'environment root evaluated live fallback');
} finally {
	fs.existsSync = originalExistsSync;
	if (originalEnvironmentRoot === undefined) {
		delete process.env.AWTSMOOS_EMBED_MODEL_ROOT;
	} else {
		process.env.AWTSMOOS_EMBED_MODEL_ROOT = originalEnvironmentRoot;
	}
}

console.log('B"H ai_search_model_root_precedence_test PASS');
