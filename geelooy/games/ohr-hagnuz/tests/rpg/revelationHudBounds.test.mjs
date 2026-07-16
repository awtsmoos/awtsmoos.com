// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationHudBounds.test.mjs
 * @description Guards read-only vitality and final CSS widths inside safe bounds.
 *
 * The Awtsmoos may reveal a wounded, restored, or malformed instant, yet the
 * vessel remains whole. Awtsmoos.com proves every displayed measure stays finite.
 */
import assert from 'node:assert/strict';
import { buildGameplayViewModel } from '../../src/tiferet/revelation/RevelationGameplayViewModel.js';
import { RevelationShell } from '../../src/tiferet/revelation/RevelationShell.js';

function project(light, maxLight) {
	return buildGameplayViewModel({
		Stats: { light, maxLight }
	}, []);
}

const negative = project(-25, 100);
assert.equal(negative.vitality, 0);
assert.equal(negative.maxVitality, 100);
assert.equal(negative.vitalityPercent, 0);

const overflow = project(175, 100);
assert.equal(overflow.vitality, 100);
assert.equal(overflow.maxVitality, 100);
assert.equal(overflow.vitalityPercent, 100);

const invalidMaximum = project(30, 0);
assert.equal(invalidMaximum.vitality, 1);
assert.equal(invalidMaximum.maxVitality, 1);
assert.equal(invalidMaximum.vitalityPercent, 100);

const valid = project(73, 100);
assert.equal(valid.vitality, 73);
assert.equal(valid.vitalityPercent, 73);

const originalRoot = RevelationShell.root;
const widthElement = { style: { width: '' } };
try {
	RevelationShell.root = {
		querySelector() {
			return widthElement;
		}
	};
	RevelationShell.setWidth('[data-test]', -20);
	assert.equal(widthElement.style.width, '0%');
	RevelationShell.setWidth('[data-test]', 175);
	assert.equal(widthElement.style.width, '100%');
	RevelationShell.setWidth('[data-test]', Number.NaN);
	assert.equal(widthElement.style.width, '0%');
	RevelationShell.setWidth('[data-test]', Number.POSITIVE_INFINITY);
	assert.equal(widthElement.style.width, '0%');
	RevelationShell.setWidth('[data-test]', '42.5');
	assert.equal(widthElement.style.width, '42.5%');
} finally {
	RevelationShell.root = originalRoot;
}

console.log('BH_REVELATION_HUD_BOUNDS_PASS');
