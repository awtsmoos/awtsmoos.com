//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-3d-presentation-contract.test.mjs
 * @description Protects dedicated and shared live-state native 3D without allowing decorative substitution or Three.js.
 * The Awtsmoos renews one gameplay truth beneath many dimensions; Awtsmoos.com proves each native garment remains semantic, reversible, and bounded.
 */
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { sharedSemantic3DRoutes, supportsOptionalNative3D } from '../scripts/runtime/native-3d/catalog.js';
import { createTetrisVisualGrid } from '../tetris/game/visual-grid.js';
import {
	applyNativeGridMatrix,
	createNativeGridPool
} from '../../libs/awtsmoos-procedural-core/src/core/gamePresentation3d/native-grid-pool.js';

const ROOT = process.cwd();
const SHARED_ROOT = 'geelooy/games/scripts/runtime/native-3d';
const EXTRA_SOURCE = [
	'geelooy/games/tetris/game/visual-grid.js',
	'geelooy/games/tetris/ui/native-3d-renderer.js',
	'geelooy/games/connect4/app/runtime/Native3DPresentation.js',
	'geelooy/games/connect4/app/runtime/Native3DRendererLoader.js'
];
const read = relative => readFile(path.join(ROOT, relative), 'utf8');

test('shared live-state native 3D covers the twenty remaining 2D gameplay routes', () => {
	const routes = sharedSemantic3DRoutes();
	assert.equal(routes.length, 20);
	for (const slug of ['adventure', 'brick-blast', 'cards', 'pong', 'shema-strike', 'sulam-ha-sod']) {
		assert.equal(supportsOptionalNative3D({ pathname: `/games/${slug}/` }), true, slug);
	}
	for (const slug of ['connect4', 'tetris', 'chess', 'cobyk', 'ohrfront', 'seven-mitzvos', 'mitzvahWorld', 'party', 'rambam']) {
		assert.equal(supportsOptionalNative3D({ pathname: `/games/${slug}/` }), false, slug);
	}
});

test('shared controller loads semantic stage instead of decorative backdrop', async () => {
	const source = await read(`${SHARED_ROOT}/Native3DModeController.js`);
	assert.match(source, /SemanticNative3DStage/);
	assert.match(source, /awtsmoos:native-3d-change/);
	assert.doesNotMatch(source, /NativeGameParticleBackdrop|ParticleBackdrop/);
});

test('canvas projector derives depth and impacts from actual current canvas pixels', async () => {
	const source = await read(`${SHARED_ROOT}/CanvasStateProjector.js`);
	assert.match(source, /drawImage\(this\.source/);
	assert.match(source, /getImageData/);
	assert.match(source, /luminance/);
	assert.match(source, /changed: delta > 72/);
});

test('DOM projector uses actual live entity geometry and computed visual state', async () => {
	const source = await read(`${SHARED_ROOT}/DomStateProjector.js`);
	assert.match(source, /getBoundingClientRect/);
	assert.match(source, /getComputedStyle/);
	assert.match(source, /data-game-entity|data-piece/);
});

test('gameplay-linked native effects react to changed descriptors and reduced motion', async () => {
	const sparks = await read(`${SHARED_ROOT}/StateSparks.js`);
	const stage = await read(`${SHARED_ROOT}/SemanticNative3DStage.js`);
	assert.match(sparks, /filter\(item => item\.changed\)/);
	assert.match(stage, /prefers-reduced-motion/);
	assert.match(stage, /native3dChangeCount/);
});

test('native 3D source obeys vessel, size, and dependency laws', async () => {
	const names = await readdir(path.join(ROOT, SHARED_ROOT));
	const files = [...EXTRA_SOURCE, ...names.filter(name => name.endsWith('.js')).map(name => `${SHARED_ROOT}/${name}`)];
	for (const relative of [...new Set(files)]) {
		const source = await read(relative);
		const lines = source.split('\n');
		assert.ok(lines.length - 1 < 120, `${relative} exceeds 119 lines`);
		assert.deepEqual(lines.slice(0, 3), ['//B"H', '//Boruch Hashem', '//Blessed is He']);
		assert.doesNotMatch(source, /\bTHREE\b|three\.module|adapters\/three/);
		assert.doesNotMatch(source, /from\s+['"](?!\.|\/|node:)[^'"]+['"]/);
	}
});

test('Tetris visual grid remains defensive and includes active plus ghost truth', () => {
	const board = Array.from({ length: 22 }, () => Array(10).fill(0));
	board[21][0] = 7;
	const before = JSON.stringify(board);
	const grid = createTetrisVisualGrid({ board, piece: { typeId: 7, matrix: [[1, 1], [1, 1]], x: 4, y: 2 } });
	assert.equal(grid.length, 20);
	assert.equal(grid[0][4], 7);
	assert.equal(grid[18][4], 'ghost');
	assert.equal(grid[19][0], 7);
	assert.equal(JSON.stringify(board), before);
});

test('native grid pool reuses meshes while canonical matrices select visibility', () => {
	const pool = createNativeGridPool({ rows: 2, columns: 2, shape: 'disc', palette: { 1: '#ff0000', 2: '#ffff00' } });
	applyNativeGridMatrix(pool, [[1, 0], [0, 2]]);
	assert.equal(pool.cells[0].visible, true);
	assert.equal(pool.cells[1].visible, false);
	assert.equal(pool.cells[3].material.name, 'GridCell:2');
	applyNativeGridMatrix(pool, [[0, 0], [0, 0]]);
	assert.equal(pool.cells.every(cell => !cell.visible), true);
});
