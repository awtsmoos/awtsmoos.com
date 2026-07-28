// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMovieActionParityTest
 * @description
 * Every action definition must generate one public convenience method and one
 * visible card selector while all mutations remain undoable through one executor.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createCinematicVillageProject } from '../geelooy/social-composer/reel-studio/nle/NleCinematicVillageFactory.js';
import { createNleMovieActionApi } from '../geelooy/social-composer/reel-studio/nle/NleMovieActionApi.js';
import { NLE_MOVIE_ACTIONS } from '../geelooy/social-composer/reel-studio/nle/NleMovieActionCatalog.js';
import { NleMovieActionExecutor } from '../geelooy/social-composer/reel-studio/nle/NleMovieActionExecutor.js';
import { validateMovieActionCatalog } from '../geelooy/social-composer/reel-studio/nle/NleMovieActionParity.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('catalog has unique IDs and API names', () => {
	const result = validateMovieActionCatalog();
	assert.equal(result.valid, true);
	assert.equal(result.ids.length, NLE_MOVIE_ACTIONS.length);
	assert.equal(result.apiNames.length, NLE_MOVIE_ACTIONS.length);
	assert.ok(NLE_MOVIE_ACTIONS.length >= 17);
});

test('public action API generates one method per catalog entry', async () => {
	const calls = [];
	const api = createNleMovieActionApi({ invoke: async (id, values) => { calls.push({ id, values }); return id; } });
	for (const action of NLE_MOVIE_ACTIONS) assert.equal(typeof api[action.apiName], 'function', action.apiName);
	assert.equal(api.list().length, NLE_MOVIE_ACTIONS.length);
	await api.addHouse({ x: 4, z: -2 });
	assert.deepEqual(calls[0], { id: 'world.addHouse', values: { x: 4, z: -2 } });
	assert.ok(Object.isFrozen(api));
});

test('executor mutates the same complete project through history', async () => {
	const state = fakeState(createCinematicVillageProject());
	const app = { openWorld() {}, playback: { pause() {}, play() {}, seek() {} }, renderAndDownload() {}, state };
	const executor = new NleMovieActionExecutor(app);
	const house = await executor.invoke('world.addHouse', { height: 8, width: 12, x: 4, z: -2 });
	const grove = await executor.invoke('world.addTreeGrove', { centerX: 0, centerZ: 0, count: 3, radius: 8 });
	assert.equal(house.houses, 12);
	assert.equal(grove.trees, 67);
	assert.deepEqual(state.reasons, ['action-add-house', 'action-add-tree-grove']);
});

test('package apply uses one state replacement', async () => {
	const state = fakeState(createCinematicVillageProject());
	const app = { openWorld() {}, playback: { pause() {}, play() {}, seek() {} }, renderAndDownload() {}, state };
	const executor = new NleMovieActionExecutor(app);
	const packageValue = await executor.invoke('project.exportPackage');
	packageValue.project.title = 'Applied package title';
	await executor.invoke('project.applyPackage', { source: packageValue });
	assert.equal(state.project.title, 'Applied package title');
	assert.equal(state.reasons.at(-1), 'action-apply-package');
});

test('UI markup and documentation derive from the action catalog', () => {
	const markup = read('geelooy/social-composer/reel-studio/nle/NleMovieActionMarkup.js');
	const docs = read('geelooy/social-composer/reel-studio/docs/API_UI_PARITY.md');
	assert.ok(markup.includes('NLE_MOVIE_ACTIONS'));
	assert.ok(markup.includes('dataset.movieAction'));
	assert.ok(docs.includes('one immutable catalog'));
	assert.ok(read('geelooy/social-composer/reel-studio/README.md').includes('movie.actions.addHouse'));
});

function fakeState(project) {
	return {
		project,
		reasons: [],
		mutate(reason, operation) { operation(this.project); this.reasons.push(reason); },
		replace(value, reason) { this.project = value; this.reasons.push(reason); }
	};
}
