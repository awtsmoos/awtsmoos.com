// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverPolicy
 * @description
 * The Awtsmoos reveals one portable boundary between canonical social truth,
 * lean AI runtime vessels, and reversible quarantine for Awtsmoos.com.
 */

const os = require('os');
const path = require('path');
const {
	EMBED_DIMENSIONS,
	EMBED_MODEL_NAME,
	GIB,
	PACKED_NAMES,
	PACKED_PATTERNS,
	REQUIRED_CANONICAL_NAMES
} = require('./policyData.js');

function configuredPolicy(environment = process.env) {
	const documentsRoot = resolve(
		environment.AWTSMOOS_DOCUMENTS_ROOT,
		path.join(os.homedir(), 'Documents')
	);
	const repositoryRoot = resolve(
		environment.AWTSMOOS_REPOSITORY_ROOT,
		path.resolve(__dirname, '../..')
	);
	const dataRoot = resolve(
		environment.AWTSMOOS_DB_ROOT || environment.AWTS_DB_ROOT,
		path.join(documentsRoot, 'awtsmoos/dayuhChadash')
	);
	const runtimeRoot = resolve(
		environment.AWTSMOOS_RUNTIME_ROOT,
		path.join(documentsRoot, 'dayuhChadash-runtime')
	);
	const reviewRoot = resolve(
		environment.AWTSMOOS_REVIEW_ROOT,
		path.join(documentsRoot, 'dayuhChadash-review')
	);
	const quarantineRoot = resolve(
		environment.AWTSMOOS_CUTOVER_QUARANTINE_ROOT,
		path.join(reviewRoot, 'final-cutover-quarantine-v1')
	);
	const packedRoot = path.join(dataRoot, 'socialPacked');
	const aiSource = path.join(dataRoot, 'ai');
	const aiDestination = path.join(runtimeRoot, 'ai');
	const ragSource = path.join(aiSource, 'comment-rag');
	const ragDestination = path.join(aiDestination, 'comment-rag');
	const runtimeRelative = 'runtime/llama/bin';
	return {
		documentsRoot,
		repositoryRoot,
		dataRoot,
		packedRoot,
		runtimeRoot,
		reviewRoot,
		quarantineRoot,
		aiSource,
		aiDestination,
		ragSource,
		ragDestination,
		embedderLabSource: path.join(ragSource, 'embedder-lab'),
		llamaBuildBin: path.join(ragSource, 'embedder-lab/llama.cpp/build/bin'),
		llamaRuntimeSource: path.join(ragSource, runtimeRelative),
		llamaRuntimeDestination: path.join(ragDestination, runtimeRelative),
		llamaRuntimeBinarySource: path.join(ragSource, runtimeRelative, 'llama-embedding'),
		llamaRuntimeBinaryDestination: path.join(ragDestination, runtimeRelative, 'llama-embedding'),
		embedModelSource: path.join(ragSource, 'models', EMBED_MODEL_NAME),
		embedModelDestination: path.join(ragDestination, 'models', EMBED_MODEL_NAME),
		embedDimensions: EMBED_DIMENSIONS,
		rawSocialSource: path.join(dataRoot, 'social'),
		cutoverStateFile: path.join(quarantineRoot, 'cutover-state.json'),
		packedNames: [...PACKED_NAMES],
		packedPatterns: [...PACKED_PATTERNS],
		requiredCanonicalNames: [...REQUIRED_CANONICAL_NAMES],
		dataHardLimitBytes: number(environment.AWTSMOOS_STORAGE_HARD_BYTES, GIB),
		runtimeHardLimitBytes: number(environment.AWTSMOOS_RUNTIME_ASSET_HARD_BYTES, GIB),
		activeHardLimitBytes: number(environment.AWTSMOOS_ACTIVE_HARD_BYTES, 2 * GIB),
		port: number(environment.PORT, 8080)
	};
}

function quarantinePath(policy, source) {
	const relative = path.relative(policy.dataRoot, source);
	return path.join(policy.quarantineRoot, 'data-root', relative);
}

function destinationFor(policy, source) {
	return source === policy.aiSource
		? policy.aiDestination
		: quarantinePath(policy, source);
}

function resolve(value, fallback) {
	return path.resolve(value || fallback);
}

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

module.exports = {
	configuredPolicy,
	destinationFor,
	quarantinePath
};
