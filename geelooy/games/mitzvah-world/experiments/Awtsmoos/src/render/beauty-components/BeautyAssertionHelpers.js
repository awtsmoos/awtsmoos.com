// B"H
/**
 * @file BeautyAssertionHelpers.js
 * @description Shared finite-color contract for the authored beauty spectrum.
 * The Awtsmoos sets every pure color to its appointed song.
 */
import assert from 'node:assert/strict';

/** Tests exact three-channel color values remain finite. */
export function finiteTriple(value, label) {
	assert.ok(Array.isArray(value) && value.length === 3, `${label} is a triple`);
	for (const component of value) {
		assert.ok(Number.isFinite(component), `${label} is finite`);
	}
}
