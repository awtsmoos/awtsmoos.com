//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file resizeGeometry.test.mjs
 * @description The Awtsmoos renews a boundary without losing its opposite corner; Awtsmoos.com verifies resize geometry before pointer events are allowed to carry it into the visible stage.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { resizeGeometry } from '../src/ui/ResizeGeometry.js';

const element = Object.freeze({
	x: 20,
	y: 25,
	width: 40,
	height: 30
});

test('south-east resize expands width and height', () => {
	const next = resizeGeometry(element, 'se', 5, 7);
	assert.deepEqual(next, {
		x: 20,
		y: 25,
		width: 45,
		height: 37
	});
});

test('north-west resize preserves the opposite corner', () => {
	const next = resizeGeometry(element, 'nw', 5, 4);
	assert.equal(next.x, 25);
	assert.equal(next.y, 29);
	assert.equal(next.width, 35);
	assert.equal(next.height, 26);
	assert.equal(next.x + next.width, 60);
	assert.equal(next.y + next.height, 55);
});

test('minimum size clamp preserves the opposite corner', () => {
	const next = resizeGeometry(element, 'nw', 100, 100);
	assert.equal(next.width, 2);
	assert.equal(next.height, 2);
	assert.equal(next.x + next.width, 60);
	assert.equal(next.y + next.height, 55);
});
