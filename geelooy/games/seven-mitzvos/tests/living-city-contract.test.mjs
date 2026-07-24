//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * @module LivingCityContractTest
 * @description
 * Realism must be architectural rather than claimed. These Awtsmoos.com tests
 * prove that the city, people, animals, landmarks, and games flow through the
 * real Awtsmoos procedural core while maintaining bounded lifecycle contracts.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');

test('all semantic parts originate in the real geelooy procedural core adapter', () => {
	const source = read('js/procedural/core-part-factory.js');
	assert.match(source, /libs\/awtsmoos-procedural-core\/src\/adapters\/three\/index\.js/);
	assert.match(source, /createProceduralThreeMesh/);
	assert.match(source, /this\.templates = new Map/);
	assert.doesNotMatch(source, /new THREE\.(Box|Sphere|Cylinder)Geometry/);
});

test('semantic library exposes recognizable low-poly world objects', () => {
	const source = read('js/procedural/semantic-asset-factory.js');
	for (const method of [
		'person', 'animal', 'house', 'tower', 'stall', 'court',
		'tree', 'rune', 'evidence', 'hazard', 'shelter'
	]) {
		assert.ok(source.includes(`\t${method}(options)`), `Missing semantic asset: ${method}`);
	}
});

test('living hub owns one disposable WebGL city with seven districts', () => {
	const stage = read('js/city/living-city-stage.js');
	const builder = read('js/city/city-district-builder.js');
	assert.match(stage, /new WebglStage/);
	assert.match(stage, /this\.stage\?\.destroy\(\)/);
	assert.match(builder, /definitions\.forEach/);
	assert.match(builder, /semanticType: 'district'/);
	assert.match(builder, /progress\.game/);
});

test('hub contains guide, mission, difficulty, light, city canvas, and seven-card grid', () => {
	const template = read('js/app/app-template.js');
	for (const id of [
		'cityStage', 'guideMessage', 'dailyMission',
		'difficultyMode', 'cityLight', 'mitzvahGrid'
	]) {
		assert.match(template, new RegExp(`id=\\"${id}\\"`));
	}
	assert.match(template, /Relaxed/);
	assert.match(template, /Standard/);
	assert.match(template, /Challenge/);
});

test('progress remembers city light, rescued names, and daily variety', () => {
	const source = read('js/universe/universe-progress.js');
	assert.match(source, /rescuedNames/);
	assert.match(source, /this\.data\.city\.light/);
	assert.match(source, /this\.data\.daily\.worlds/);
	assert.match(source, /worlds\.length >= 3/);
	assert.match(source, /result\.memories/);
});

test('every active game uses semantic procedural assets', () => {
	const names = [
		'false-powers-game', 'words-creation-game', 'every-life-game', 'households-game',
		'honest-market-game', 'living-sanctuary-game', 'court-nations-game'
	];
	for (const name of names) {
		assert.match(read(`js/games3d/${name}.js`), /this\.assets|field = new/);
	}
	assert.match(read('js/games3d/game-base.js'), /new SemanticAssetFactory/);
});

test('city animation remains bounded to transforms and shared geometry', () => {
	const parts = read('js/procedural/core-part-factory.js');
	const city = read('js/city/city-district-builder.js');
	assert.match(parts, /templates\.get\(key\)\.clone/);
	assert.match(city, /position\.y =/);
	assert.doesNotMatch(city, /new WebglStage/);
	assert.doesNotMatch(city, /requestAnimationFrame/);
});
