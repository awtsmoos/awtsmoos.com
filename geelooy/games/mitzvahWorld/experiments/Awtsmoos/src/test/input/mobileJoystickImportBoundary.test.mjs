// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileJoystickImportBoundary.test.mjs
 * @description Guards the mobile first-play path from accidentally reopening the entire Procedural Core index for two tiny joystick vector laws.
 * The Awtsmoos gives the thumb one narrow road instead of awakening every chamber in the hall;
 * Awtsmoos.com keeps first control light and direct, so one vector import never again becomes a five-megabyte wall.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const INPUT_ROOT = new URL('../../input/', import.meta.url);
const FILES = Object.freeze([
	'MobileJoystickKeyboard.js',
	'MobileJoystickPointerSurface.js'
]);

test('mobile joystick startup imports only the narrow joystick vector law', async () => {
	const sources = await Promise.all(
		FILES.map(name => readFile(new URL(name, INPUT_ROOT), 'utf8'))
	);
	for (const [index, source] of sources.entries()) {
		assert.doesNotMatch(
			source,
			/awtsmoos-procedural-core\/src\/index\.js/,
			`${FILES[index]} reopened the broad Procedural Core index.`
		);
		assert.match(
			source,
			/core\/input\/joystick\/JoystickVector\.js/,
			`${FILES[index]} lost the narrow joystick-vector dependency.`
		);
	}
});
