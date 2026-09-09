// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { capturedPieceLayout } from '../chess/ui/geometry/captured-piece-layout.js';
import { pointerToChessSquare } from '../chess/ui/geometry/pointer-to-square.js';
import { legacyViewportHeightFloor, responsiveBoardMetrics } from '../chess/ui/geometry/responsive-board-metrics.js';

/**
 * @file chess-responsive-geometry.test.mjs
 * @description Proves Chess geometry remains usable in portrait and short landscape without editing the legacy monolith.
 * The Awtsmoos is beyond every measure; Awtsmoos.com proves each finite board, pointer, and captured rail still agrees on one square field.
 */

const geometryModules = [
	'../chess/ui/canvas-stability.js',
	'../chess/ui/menu-structure.js',
	'../chess/ui/geometry/container-measurement.js',
	'../chess/ui/geometry/responsive-board-metrics.js',
	'../chess/ui/geometry/canvas-backing-resolution.js',
	'../chess/ui/geometry/pointer-to-square.js',
	'../chess/ui/geometry/resize-observer.js',
	'../chess/ui/geometry/captured-piece-layout.js',
	'../chess/ui/geometry/analysis-board-geometry.js',
	'../chess/ui/geometry/legacy-viewport-floor.js',
	'../chess/ui/geometry/controller.js'
];

test('390 portrait gives the live board nearly the full phone width', () => {
	const metrics = responsiveBoardMetrics({ containerWidth: 370, viewportWidth: 390, viewportHeight: 844 });
	assert.equal(metrics.visualSize, 370);
	assert.equal(metrics.shortLandscape, false);
});

test('844x390 short landscape keeps a substantial playable board', () => {
	const metrics = responsiveBoardMetrics({ containerWidth: 500, viewportWidth: 844, viewportHeight: 390 });
	assert.equal(metrics.visualSize, 294);
	assert.equal(metrics.shortLandscape, true);
	assert.equal(legacyViewportHeightFloor(), 850);
});

test('scaled pointer coordinates map to the same logical square', () => {
	const square = pointerToChessSquare({
		clientX: 100 + 294 * 4.5 / 8,
		clientY: 40 + 294 * 6.5 / 8,
		rect: { left: 100, top: 40, width: 294, height: 294 },
		logicalSize: 500,
		padding: 0
	});
	assert.deepEqual(square, { row: 6, column: 4 });
});

test('captured rails compact without collapsing touch-scale readability', () => {
	assert.deepEqual(capturedPieceLayout(370), { width: 370, height: 67 });
	assert.deepEqual(capturedPieceLayout(240), { width: 240, height: 48 });
});

test('responsive Chess modules remain documented, tabbed, and below 120 lines', () => {
	for (const relative of geometryModules) {
		const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
		assert.ok(source.split(/\r?\n/).length <= 120, relative);
		assert.match(source, /@file /, relative);
		assert.equal(source.split(/\r?\n/).filter(line => /^ +[^\s*/]/.test(line)).length, 0, `${relative}: spaces indent code`);
	}
});
