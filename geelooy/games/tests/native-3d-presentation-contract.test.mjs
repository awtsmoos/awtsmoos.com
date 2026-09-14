//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-3d-presentation-contract.test.mjs
 * @description Freezes the scratch-built optional 3D architecture: strict source
 * vessels, lazy loading, renderer-neutral Tetris projection, and reusable native
 * grid state without permitting THREE.js or package imports into production code.
 */
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createTetrisVisualGrid } from '../tetris/game/visual-grid.js';
import {
	applyNativeGridMatrix,
	createNativeGridPool
} from '../../libs/awtsmoos-procedural-core/src/core/gamePresentation3d/native-grid-pool.js';

const ROOT = process.cwd();
const SOURCE_ROOTS = [
	'geelooy/games/scripts/runtime/native-3d',
	'geelooy/libs/awtsmoos-procedural-core/src/core/gamePresentation3d'
];
const EXTRA_SOURCE = [
	'geelooy/games/tetris/game/visual-grid.js',
	'geelooy/games/tetris/ui/native-3d.js',
	'geelooy/games/tetris/ui/native-3d-mode.js',
	'geelooy/games/tetris/ui/native-3d-renderer.js',
	'geelooy/games/connect4/app/runtime/Native3DPresentation.js',
	'geelooy/games/connect4/app/runtime/Native3DPresentationLifecycle.js',
	'geelooy/games/connect4/app/runtime/Native3DPresentationMode.js',
	'geelooy/games/connect4/app/runtime/Native3DRendererLoader.js'
];

/** Collect only production JS source in the new optional 3D graph. */
async function sourceFiles() {
	const files = [...EXTRA_SOURCE];
	for (const root of SOURCE_ROOTS) {
		const names = await readdir(path.join(ROOT, root));
		files.push(...names
			.filter(name => name.endsWith('.js'))
			.map(name => `${root}/${name}`));
	}
	return [...new Set(files)].sort();
}

/** Read one repository-relative UTF-8 source vessel. */
async function source(relativePath) {
	return readFile(path.join(ROOT, relativePath), 'utf8');
}

test('native 3D source obeys strict vessel and dependency law', async () => {
	for (const relativePath of await sourceFiles()) {
		const text = await source(relativePath);
		const lines = text.split('\n');
		assert.ok(lines.length - 1 < 120, `${relativePath} exceeds 119 lines`);
		assert.deepEqual(lines.slice(0, 3), ['//B"H', '//Boruch Hashem', '//Blessed be He']);
		assert.doesNotMatch(text, /\bTHREE\b|three\.module|adapters\/three/);
		assert.doesNotMatch(text, /from\s+['"](?!\.|\/|node:)[^'"]+['"]/);
	}
});

test('ordinary 2D controllers keep Procedural Core behind dynamic import', async () => {
	for (const relativePath of [
		'geelooy/games/scripts/runtime/native-3d/Native3DModeController.js',
		'geelooy/games/tetris/ui/native-3d-renderer.js',
		'geelooy/games/connect4/app/runtime/Native3DRendererLoader.js'
	]) {
		const text = await source(relativePath);
		assert.match(text, /import\(/);
		assert.doesNotMatch(text, /from\s+['"][^'"]*gamePresentation3d/);
	}
});

test('Tetris visual grid is defensive and includes active plus ghost truth', () => {
	const board = Array.from({ length: 22 }, () => Array(10).fill(0));
	board[21][0] = 7;
	const before = JSON.stringify(board);
	const game = {
		board,
		piece: {
			typeId: 7,
			matrix: [[1, 1], [1, 1]],
			x: 4,
			y: 2
		}
	};
	const grid = createTetrisVisualGrid(game);
	assert.equal(grid.length, 20);
	assert.equal(grid[0][4], 7);
	assert.equal(grid[18][4], 'ghost');
	assert.equal(grid[19][0], 7);
	assert.equal(JSON.stringify(board), before);
});

test('native grid pool reuses meshes while canonical matrices select visibility', () => {
	const pool = createNativeGridPool({
		rows: 2,
		columns: 2,
		shape: 'disc',
		palette: { 1: '#ff0000', 2: '#ffff00' }
	});
	assert.equal(pool.cells.length, 4);
	applyNativeGridMatrix(pool, [[1, 0], [0, 2]]);
	assert.equal(pool.cells[0].visible, true);
	assert.equal(pool.cells[1].visible, false);
	assert.equal(pool.cells[3].material.name, 'GridCell:2');
	applyNativeGridMatrix(pool, [[0, 0], [0, 0]]);
	assert.equal(pool.cells.every(cell => !cell.visible), true);
});
