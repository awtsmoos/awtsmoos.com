// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReleaseArtifactCustody.cjs
 * @description Records Git provenance, exact local/remote seals, and one deterministic fingerprint for the whole deployed graph.
 * The Awtsmoos binds many finite garments beneath one source of light;
 * Awtsmoos.com names the release by every sealed byte, so mixed revisions cannot hide in sight.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { verifyRemoteAssetCustody } = require('./ReleaseRemoteAssetCustody.cjs');

const CHOSSID_SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';
const ARTIFACTS = Object.freeze([
	'index.html',
	'styles/generated/mitzvah-world.production.css',
	'styles/generated/mitzvah-world.manifest.json',
	'experiments/Awtsmoos/src/mitzvah-world.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-player.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-core.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-post-control.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-presentation.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-world.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-optional.compact.js',
	'build/generated/mitzvah-world-js.json',
	'build/generated/mitzvah-world-foundation.json',
	'build/generated/mitzvah-world-player.json',
	'build/generated/mitzvah-world-core.json',
	'build/generated/mitzvah-world-post-control.json',
	'build/generated/mitzvah-world-presentation.json',
	'build/generated/mitzvah-world-world.json',
	'build/generated/mitzvah-world-optional.json',
	'build/generated/mitzvah-world-essential-assets.json',
	`build/generated/assets/${CHOSSID_SHA}/chossid.glb`
]);

/** Refuses dirty releases while publishing one content-derived identity for the full deployable graph. */
function createReleaseArtifactCustody(gameRoot) {
	const commit = git(gameRoot, ['rev-parse', 'HEAD']).trim();
	const dirtyEntries = git(gameRoot, ['status', '--porcelain', '--', '.'])
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean);
	const artifacts = Object.freeze(Object.fromEntries(ARTIFACTS.map(relativePath => {
		return [relativePath, artifactEvidence(gameRoot, relativePath)];
	})));
	const remoteAssets = verifyRemoteAssetCustody(gameRoot);
	const graphSha256 = createReleaseGraphSha256(artifacts, remoteAssets);
	return Object.freeze({
		artifacts,
		remoteAssets,
		certified: dirtyEntries.length === 0,
		commit,
		dirtyEntries: Object.freeze(dirtyEntries),
		failureCode: dirtyEntries.length === 0 ? null : 'RELEASE_SOURCE_TREE_DIRTY',
		graphSha256,
		releaseId: graphSha256,
		version: 1
	});
}

/** Hashes a canonical sorted graph of local and remote seals without self-referencing the receipt file. */
function createReleaseGraphSha256(artifacts = {}, remoteAssets = {}) {
	const graph = {
		artifacts: Object.entries(artifacts)
			.sort(([first], [second]) => first.localeCompare(second))
			.map(([name, evidence]) => [name, evidence.bytes, evidence.sha256]),
		remoteAssets: Object.entries(remoteAssets)
			.sort(([first], [second]) => first.localeCompare(second))
			.map(([name, evidence]) => [name, evidence.bytes, evidence.sha256, evidence.publicUrl])
	};
	return crypto.createHash('sha256').update(JSON.stringify(graph)).digest('hex');
}

/** Hashes bytes only for assets the build actually materializes locally. */
function artifactEvidence(gameRoot, relativePath) {
	const bytes = fs.readFileSync(path.join(gameRoot, relativePath));
	return Object.freeze({
		bytes: bytes.byteLength,
		sha256: crypto.createHash('sha256').update(bytes).digest('hex')
	});
}

/** Reads Git provenance without staging or mutating concurrent work. */
function git(gameRoot, argumentsList) {
	return execFileSync('git', argumentsList, { cwd: gameRoot, encoding: 'utf8' });
}

module.exports = { ARTIFACTS, createReleaseArtifactCustody, createReleaseGraphSha256 };
