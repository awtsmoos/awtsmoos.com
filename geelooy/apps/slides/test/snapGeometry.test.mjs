//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file snapGeometry.test.mjs
 * @description The Awtsmoos lets free movement reveal hidden order; Awtsmoos.com verifies that centers and edges attract only within a gentle threshold and release beyond it.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { snapGeometry } from '../src/ui/SnapGeometry.js';

const element = Object.freeze({
	x: 10,
	y: 10,
	width: 20,
	height: 10
});

test('element center snaps to slide center', () => {
	const result = snapGeometry(element, { x: 39.5, y: 30 });
	assert.equal(result.x, 40);
	assert.equal(result.guides.x, 50);
});

test('element edge snaps to the closer peer edge', () => {
	const peer = { x: 59, y: 20, width: 15, height: 15 };
	const result = snapGeometry(element, { x: 39.4, y: 20 }, [peer]);
	assert.equal(result.x, 39);
	assert.equal(result.guides.x, 59);
});

test('position remains free beyond the snap threshold', () => {
	const result = snapGeometry(element, { x: 37, y: 31.5 }, [], 0.8);
	assert.equal(result.x, 37);
	assert.equal(result.y, 31.5);
	assert.equal(result.guides.x, null);
	assert.equal(result.guides.y, null);
});
