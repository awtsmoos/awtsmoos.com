// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraOrbitController.test.mjs
 * @description Proves first-person follow evidence and complete gesture listener disposal.
 * The Awtsmoos creates sight without leaving old listeners behind; Awtsmoos.com verifies that
 * a Chossid's eye follows the supplied anchor and every finite event doorway can close.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CameraOrbitController } from './CameraOrbitController.js';

function listenerTarget() {
	const active = new Map();
	return {
		active,
		addEventListener(type, listener) {
			active.set(`${type}:${active.size}`, listener);
		},
		removeEventListener(type, listener) {
			for (const [key, candidate] of active) {
				if (key.startsWith(`${type}:`) && candidate === listener) active.delete(key);
			}
		}
	};
}

function fixture() {
	const view = listenerTarget();
	const document = { ...listenerTarget(), defaultView: view, hidden: false };
	const canvas = {
		...listenerTarget(),
		ownerDocument: document,
		style: {}
	};
	return { canvas, document, view };
}

test('first-person camera follows the supplied player face anchor', () => {
	const { canvas } = fixture();
	const controller = new CameraOrbitController(canvas, { yaw: 0 });
	const camera = {
		position: { set(x, y, z) { Object.assign(this, { x, y, z }); } },
		target: null
	};
	controller.setMode('firstPerson');
	controller.apply(camera, { x: 2, y: 1.7, z: 3 }, null);
	assert.deepEqual(camera.position, { x: 2, y: 1.7, z: 3.24, set: camera.position.set });
	assert.equal(controller.stats.mode, 'first-person');
	assert.equal(controller.stats.position.y, 1.7);
	controller.destroy();
});

test('destroy releases canvas, document, and window listeners', () => {
	const { canvas, document, view } = fixture();
	const controller = new CameraOrbitController(canvas);
	assert.ok(canvas.active.size > 0);
	assert.ok(document.active.size > 0);
	assert.ok(view.active.size > 0);
	controller.destroy();
	assert.equal(canvas.active.size, 0);
	assert.equal(document.active.size, 0);
	assert.equal(view.active.size, 0);
});
