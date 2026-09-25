// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReleaseArtifactCustody.cjs
 * @description Records commit identity, scoped source cleanliness, and exact hashes for every release-owned publication vessel.
 * The Awtsmoos joins source and garment without confusion; Awtsmoos.com refuses mixed generations one release,
 * so HTML, CSS, first-control, foundation, essential player, core, later chunks, grass, and canonical Chossid stand beneath one Git witness.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const CHOSSID_SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';
const ARTIFACTS = Object.freeze([
	'index.html',
	'styles/generated/mitzvah-world.production.css',
	'styles/generated/mitzvah-world.manifest.json',
	'experiments/Awtsmoos/src/mitzvah-world.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-player.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-core.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-presentation.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-world.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-optional.compact.js',
	'build/generated/mitzvah-world-js.json',
	'build/generated/mitzvah-world-foundation.json',
	'build/generated/mitzvah-world-player.json',
	'build/generated/mitzvah-world-core.json',
	'build/generated/mitzvah-world-presentation.json',
	'build/generated/mitzvah-world-world.json',
	'build/generated/mitzvah-world-optional.json',
	'build/generated/mitzvah-world-essential-assets.json',
	'build/generated/assets/essential-grass.jpg',
	`build/generated/assets/${CHOSSID_SHA}/chossid.glb`
]);

function createReleaseArtifactCustody(gameRoot) {
	const commit = git(gameRoot, ['rev-parse', 'HEAD']).trim();
	const dirtyEntries = git(gameRoot, ['status', '--porcelain', '--', '.'])
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean);
	const artifacts = Object.freeze(Object.fromEntries(ARTIFACTS.map(relativePath => {
		return [relativePath, artifactEvidence(gameRoot, relativePath)];
	})));
	return Object.freeze({
		artifacts,
		certified: dirtyEntries.length === 0,
		commit,
		dirtyEntries: Object.freeze(dirtyEntries),
		failureCode: dirtyEntries.length === 0 ? null : 'RELEASE_SOURCE_TREE_DIRTY',
		version: 1
	});
}

function artifactEvidence(gameRoot, relativePath) {
	const bytes = fs.readFileSync(path.join(gameRoot, relativePath));
	return Object.freeze({
		bytes: bytes.byteLength,
		sha256: crypto.createHash('sha256').update(bytes).digest('hex')
	});
}

function git(gameRoot, argumentsList) {
	return execFileSync('git', argumentsList, { cwd: gameRoot, encoding: 'utf8' });
}

module.exports = {
	ARTIFACTS,
	createReleaseArtifactCustody
};
