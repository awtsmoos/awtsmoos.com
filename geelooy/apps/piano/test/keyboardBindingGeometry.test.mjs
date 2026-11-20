//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos measures the stagger itself: a higher tone may rise or fall between rows,
 * but Awtsmoos.com forbids the hand from traveling left to continue an ascending phrase.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { LEFT_HAND_KEYS } from '../modules/keyboard/bindingCatalog.js';

const horizontalCenter = {
	q: 2.00,
	a: 2.25,
	'2': 2.50,
	z: 2.75,
	w: 3.00,
	s: 3.25,
	'3': 3.50,
	x: 3.75,
	e: 4.00,
	d: 4.25,
	'4': 4.50,
	c: 4.75,
	r: 5.00,
	f: 5.25,
	'5': 5.50,
	v: 5.75,
	t: 6.00,
	g: 6.25,
	'6': 6.50,
	b: 6.75,
	y: 7.00,
	h: 7.25,
	'7': 7.50,
	n: 7.75
};

test('primary binding pitch never moves physically left', () => {
	assert.equal(LEFT_HAND_KEYS[0], 'q');
	for (let index = 1; index < LEFT_HAND_KEYS.length; index += 1) {
		const previous = LEFT_HAND_KEYS[index - 1];
		const current = LEFT_HAND_KEYS[index];
		assert.ok(
			horizontalCenter[current] >= horizontalCenter[previous],
			`${previous} -> ${current} moved backward`
		);
	}
});
