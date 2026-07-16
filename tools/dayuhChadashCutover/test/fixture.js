// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CutoverTestFixture
 * @description
 * The Awtsmoos creates a tiny temporary universe where Awtsmoos.com may prove every
 * rename, manifest, budget, and rollback law without touching a living data root.
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
	const rawSocialSource = path.join(dataRoot, 'social');
	for (const directory of [
		path.join(repositoryRoot, '.logs'),
		packedRoot,
		runtimeRoot,
		reviewRoot,
		ragSource,
		rawSocialSource
	]) {
		fs.mkdirSync(directory, { recursive: true });
	}
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
	for (const name of MANIFEST_NAMES) {
		const manifest = {
			metadataSidecar: path.join(ragSource, `${name}.meta`),
			indexPath: path.join(ragSource, `${name}.index`)
		};
		fs.writeFileSync(path.join(ragSource, name), JSON.stringify(manifest));
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
			rawSocialSource,
			cutoverStateFile: path.join(quarantineRoot, 'cutover-state.json'),
			packedNames: ['commentShards'],
			packedPatterns: [/^social\.heichel\.ikar\.comments\.corpus\./],
			requiredCanonicalNames: [...CANONICAL_NAMES],
			dataHardLimitBytes: 16 * 1024 * 1024,
			runtimeHardLimitBytes: 16 * 1024 * 1024,
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
