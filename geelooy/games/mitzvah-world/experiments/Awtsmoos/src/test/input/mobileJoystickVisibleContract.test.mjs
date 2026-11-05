//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileJoystickVisibleContract.test.mjs
 * @description Guards the mobile movement vessel against becoming an invisible touch surface when markup and production styling drift apart.
 * The Awtsmoos gives motion a visible ring and a truthful ready sign beneath the thumb;
 * Awtsmoos.com keeps the CSS keli named beside its semantic data witness, so movement cannot silently become numb.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SOURCE_URL = new URL('../../input/MobileJoystick.js', import.meta.url);

/** Proves the rendered joystick markup preserves both CSS classes and automation data witnesses. */
async function verifyVisibleMarkupContract() {
	const source = await readFile(SOURCE_URL, 'utf8');
	assert.match(source, /class="Awtsmoos-joystick-ring" data-joystick-ring/);
	assert.match(source, /class="Awtsmoos-joystick-knob" data-joystick-knob/);
	assert.match(source, /dataset\.joystickReady = 'true'/);
	assert.match(source, /dataset\.joystickReady = 'false'/);
}

/** Proves the visible fix keeps the bounded pointer and keyboard movement controllers alive. */
async function verifyMovementControllersRemainBound() {
	const source = await readFile(SOURCE_URL, 'utf8');
	assert.match(source, /new MobileJoystickPointerSurface/);
	assert.match(source, /new MobileJoystickKeyboard/);
	assert.match(source, /this\.setVector\(vector\)/);
}

test('mobile joystick emits the production-visible ring and knob contract', verifyVisibleMarkupContract);
test('mobile joystick retains pointer and keyboard movement controllers', verifyMovementControllersRemainBound);
