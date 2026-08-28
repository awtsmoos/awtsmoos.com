// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bhReleaseContract.test.mjs
 * @description
 * The Awtsmoos binds Awtsmoos.com production to one published `main` witness:
 * prepare may advance Git normally, while activate accepts only an exact clean SHA.
 * Retired archive publication must never return through a stale contract test.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function releaseSource() {
	return readFileSync(new URL('../bhRelease.mjs', import.meta.url), 'utf8');
}

function snapshotPublisherSource() {
	return readFileSync(new URL('./publishLocalSnapshot.mjs', import.meta.url), 'utf8');
}

test('bh release is main-only and rejects force publication', () => {
	const source = releaseSource();
	assert.match(source, /target\.branch !== "main"/);
	assert.match(source, /refusing non-fast-forward release/);
	assert.doesNotMatch(source, /--force/);
});

test('prepare requires audited loose-work closure before normal publication', () => {
	const source = releaseSource();
	const looseGate = source.indexOf('assertNoLooseWork(options.state)');
	const push = source.indexOf('run("git", ["push"');
	assert.ok(looseGate >= 0);
	assert.ok(push > looseGate);
	assert.match(source, /verifyHomeSource\.mjs/);
	assert.match(source, /repository-hygiene\/check\.cjs/);
});

test('activation requires a clean exact published SHA and production verification', () => {
	const source = releaseSource();
	const cleanGate = source.indexOf('assertCompletelyClean(options.state)');
	const exactSha = source.indexOf('requireActivationSha(options.phase)');
	const deploy = source.indexOf('deployCommand(sha, options.target.branch)');
	assert.ok(cleanGate >= 0);
	assert.ok(exactSha > cleanGate);
	assert.ok(deploy > exactSha);
	assert.match(source, /Activation SHA mismatch/);
	assert.match(source, /verifyHomeProduction\.mjs/);
	assert.match(source, /verifyTunnelPublicRelease\.mjs/);
});

test('retired local snapshot publication cannot masquerade as production authority', () => {
	const release = releaseSource();
	const publisher = snapshotPublisherSource();
	assert.doesNotMatch(release, /buildLocalSnapshot\.mjs/);
	assert.doesNotMatch(release, /publishLocalSnapshot\.mjs/);
	assert.match(publisher, /SERVER_SOURCE_SNAPSHOT_RETIRED/);
	assert.match(publisher, /server_source_snapshot_retired_use_published_main/);
});
