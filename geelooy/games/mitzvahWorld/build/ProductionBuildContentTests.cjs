//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ProductionBuildContentTests.cjs
 * @description Separately proves local model custody, remote image custody, and authored deferred cinema.
 * The Awtsmoos keeps dense models in the release vessel while photographic light remains hash-pinned in Drive.
 */

'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { GRASS_SHA, GRASS_URL } = require('./EssentialReleaseAssetBuilder.cjs');
const { cinemaSources, text } = require('./ProductionBuildProof.cjs');

const GAME_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(GAME_ROOT, '../../..');
const LOCAL_ESSENTIALS = Object.freeze([
	'build/generated/assets/canonical-chossid.glb',
	'build/generated/assets/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb'
]);
const LEGACY_GRASS = 'build/generated/assets/essential-grass.jpg';

test('first-play model assets retain local tracked custody', () => {
	for (const relative of LOCAL_ESSENTIALS) {
		const absolute = path.join(GAME_ROOT, relative);
		assert.ok(fs.statSync(absolute).size > 0, `${relative} must exist`);
		const repoRelative = path.relative(REPO_ROOT, absolute).replaceAll('\\', '/');
		assert.doesNotThrow(() => childProcess.execFileSync('git', [
			'-C', REPO_ROOT, 'ls-files', '--error-unmatch', repoRelative
		], { stdio: 'ignore' }), `${relative} must travel in Git releases`);
	}
});

test('essential grass has immutable remote custody and no local Git body', async () => {
	const legacy = path.join(GAME_ROOT, LEGACY_GRASS);
	assert.equal(fs.existsSync(legacy), false, 'legacy grass body must stay absent');
	assert.throws(() => childProcess.execFileSync('git', [
		'-C', REPO_ROOT, 'ls-files', '--error-unmatch', path.relative(REPO_ROOT, legacy)
	], { stdio: 'ignore' }));
	const response = await fetch(GRASS_URL, { signal: AbortSignal.timeout(20000) });
	assert.equal(response.ok, true, `Drive grass returned ${response.status}`);
	const bytes = Buffer.from(await response.arrayBuffer());
	assert.equal(bytes.length, 322486);
	assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), GRASS_SHA);
});

test('generated essential manifest records remote grass custody', () => {
	const manifest = JSON.parse(fs.readFileSync(path.join(GAME_ROOT, 'build/generated/mitzvah-world-essential-assets.json'), 'utf8'));
	const grass = manifest.assets?.essentialGrass;
	assert.equal(grass?.custody, 'remote');
	assert.equal(grass?.materialized, false);
	assert.equal(grass?.publicUrl, GRASS_URL);
	assert.equal(grass?.sourceUrl, GRASS_URL);
	assert.equal(grass?.sha256, GRASS_SHA);
});

test('deferred creative mode contains the served cinema graph', () => {
	const loader = text('experiments/Awtsmoos/src/launcher/MitzvahWorldCreativeModeLoaders.js');
	const api = text('experiments/Awtsmoos/src/movie/MovieStudioApi.js');
	const cinema = cinemaSources();
	assert.match(loader, /import\('\.\.\/movie\/MovieStudio\.js'\)/);
	assert.match(api, /createMovieStudioCinemaDomain/);
	for (const marker of [
		'createMovieCinemaFlagship', 'one-minute-chassidic-village',
		'assets/models/player/chossid.glb', 'MOVIE_CINEMA_VIDEO_PROGRESS_WEIGHT',
		'UNSAFE_CINEMA_HUMAN'
	]) assert.match(cinema, new RegExp(marker), marker);
});
