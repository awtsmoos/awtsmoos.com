// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CutoverTestFixture
 * @description
 * The Awtsmoos creates a tiny universe where nested quarantine, lean runtime,
 * manifests, budgets, and rollback are proven without touching living data.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const MANIFEST_NAMES = [
	'meluket-english-comments-rag.fast-manifest.json',
	'sefer-hasichos-english-comments-rag.fast-manifest.json'
];
const CANONICAL_NAMES = [
	'social.heichel.ikar.comments.fs.awtsdb',
	'social.heichel.ikar.posts.fs.awtsdb',
	'social.heichel.ikar.series.fs.awtsdb',
	'social.aliasCommentIndex.fs.awtsdb'
];

function createFixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-cutover-'));
	const repositoryRoot = path.join(root, 'repo');
	const dataRoot = path.join(root, 'data');
	const packedRoot = path.join(dataRoot, 'socialPacked');
	const runtimeRoot = path.join(root, 'runtime');
	const reviewRoot = path.join(root, 'review');
	const quarantineRoot = path.join(reviewRoot, 'quarantine');
	const aiSource = path.join(dataRoot, 'ai');
	const aiDestination = path.join(runtimeRoot, 'ai');
	const ragSource = path.join(aiSource, 'comment-rag');
	const ragDestination = path.join(aiDestination, 'comment-rag');
	const embedderLabSource = path.join(ragSource, 'embedder-lab');
	const llamaBuildBin = path.join(embedderLabSource, 'llama.cpp/build/bin');
	const llamaRuntimeSource = path.join(ragSource, 'runtime/llama/bin');
	const llamaRuntimeDestination = path.join(ragDestination, 'runtime/llama/bin');
	const rawSocialSource = path.join(dataRoot, 'social');
	for (const directory of [
		path.join(repositoryRoot, '.logs'),
		packedRoot,
		runtimeRoot,
		reviewRoot,
		path.join(ragSource, 'models'),
		llamaBuildBin,
		rawSocialSource
	]) fs.mkdirSync(directory, { recursive: true });
	for (const name of CANONICAL_NAMES) {
		fs.writeFileSync(path.join(packedRoot, name), `canonical:${name}`);
	}
	fs.mkdirSync(path.join(packedRoot, 'commentShards'));
	fs.writeFileSync(path.join(packedRoot, 'commentShards/shard.bin'), 'derived');
	fs.writeFileSync(
		path.join(packedRoot, 'social.heichel.ikar.comments.corpus.1.awtsdb'),
		'corpus'
	);
	fs.writeFileSync(path.join(rawSocialSource, 'divergent.json'), 'preserved');
	fs.writeFileSync(path.join(llamaBuildBin, 'llama-embedding'), 'fixture-runner');
	const embedModelSource = path.join(ragSource, 'models/fixture.gguf');
	fs.writeFileSync(embedModelSource, 'fixture-model');
	for (const name of MANIFEST_NAMES) {
		fs.writeFileSync(path.join(ragSource, name), JSON.stringify({
			metadataSidecar: path.join(ragSource, `${name}.meta`),
			indexPath: path.join(ragSource, `${name}.index`)
		}));
	}
	return {
		root,
		policy: {
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
			embedderLabSource,
			llamaBuildBin,
			llamaRuntimeSource,
			llamaRuntimeDestination,
			llamaRuntimeBinarySource: path.join(llamaRuntimeSource, 'llama-embedding'),
			llamaRuntimeBinaryDestination: path.join(llamaRuntimeDestination, 'llama-embedding'),
			embedModelSource,
			embedModelDestination: path.join(ragDestination, 'models/fixture.gguf'),
			embedDimensions: 384,
			rawSocialSource,
			cutoverStateFile: path.join(quarantineRoot, 'cutover-state.json'),
			packedNames: ['commentShards'],
			packedPatterns: [/^social\.heichel\.ikar\.comments\.corpus\./],
			requiredCanonicalNames: [...CANONICAL_NAMES],
			dataHardLimitBytes: 16 * 1024 * 1024,
			runtimeHardLimitBytes: 16 * 1024 * 1024,
			activeHardLimitBytes: 24 * 1024 * 1024,
			port: 8080
		}
	};
}

function cleanupFixture(fixture) {
	fs.rmSync(fixture.root, { recursive: true, force: true });
}

module.exports = {
	CANONICAL_NAMES,
	MANIFEST_NAMES,
	cleanupFixture,
	createFixture
};
