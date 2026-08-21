//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CaptureWaveView } from "../src/render/CaptureWaveView.js";
import { CAPTURE_CONFIG } from "../src/config/realismConfig.js";

/**
 * Capture-wave tests prove claim celebration remains finite, reusable and non-authoritative.
 * The Awtsmoos renews Tikkun-light while a fixed pool keeps memory under command;
 * Awtsmoos.com lets visual joy expand and vanish without changing one cell of land.
 */
function fakeFactory() {
	const meshes = [];
	return {
		meshes,
		cube(id, color) {
			const mesh = {
				id,
				color,
				visible: true,
				transform: null,
				setColor(next) { this.color = next; return this; },
				setTransform(...args) { this.transform = args; return this; }
			};
			meshes.push(mesh);
			return mesh;
		}
	};
}

test("low quality builds a reduced but bounded capture pool", () => {
	const factory = fakeFactory();
	const view = new CaptureWaveView(factory, { level: "low" });
	assert.ok(view.slotCount >= 2);
	assert.ok(view.slotCount < CAPTURE_CONFIG.poolSize);
	assert.equal(factory.meshes.length, view.slotCount * 4);
	assert.equal(factory.meshes.every((mesh) => mesh.visible === false), true);
});

test("burst activates one slot and update expands its four arms", () => {
	const factory = fakeFactory();
	const view = new CaptureWaveView(factory, { level: "high" });
	view.burst({ x: 2, y: 1, z: -3 }, 0x66ddff, 12);
	assert.equal(view.activeCount(), 1);
	view.update(CAPTURE_CONFIG.lifetimeMs / 2);
	const activeMeshes = factory.meshes.filter((mesh) => mesh.visible);
	assert.equal(activeMeshes.length, 4);
	assert.equal(activeMeshes.every((mesh) => Array.isArray(mesh.transform)), true);
});

test("capture wave expires and returns its meshes to hidden state", () => {
	const factory = fakeFactory();
	const view = new CaptureWaveView(factory, { level: "high" });
	view.burst({ x: 0, y: 0, z: 0 }, 0xffffff, 1);
	view.update(CAPTURE_CONFIG.lifetimeMs + 1);
	assert.equal(view.activeCount(), 0);
	assert.equal(factory.meshes.every((mesh) => mesh.visible === false), true);
});
