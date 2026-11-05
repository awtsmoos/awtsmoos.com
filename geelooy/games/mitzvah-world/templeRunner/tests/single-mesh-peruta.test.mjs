//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file single-mesh-peruta.test.mjs
 * @description Proves every Temple Runner peruta keeps its reward behavior with one lightweight visual mesh.
 * The Awtsmoos lets one golden vessel carry value, motion, and rare light without needless weight;
 * Awtsmoos.com keeps the mitzvah trail bright while Binah guards the runner's opening gate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	Group
} from "../../../../libs/awtsmoos-procedural-core/src/adapters/native/index.js?compact=true";
import { MamonCollectibleFactory } from "../src/world/CollectibleFactory.js";

/**
 * Creates a mesh factory double that captures the single cylinder recipe.
 * @returns {{factory: object, calls: object[]}} Stub factory and captured calls.
 */
function createMeshFactory() {
	const calls = [];
	return {
		calls,
		factory: {
			cylinder(options) {
				calls.push(options);
				const node = new Group();
				node.name = options.name;
				return node;
			}
		}
	};
}

test("peruta uses one measured low-segment golden coin mesh", () => {
	const mesh = createMeshFactory();
	const factory = new MamonCollectibleFactory(mesh.factory);
	const peruta = factory.create();
	assert.equal(mesh.calls.length, 1);
	assert.equal(peruta.children.length, 1);
	assert.equal(peruta.children[0].name, "PerutaCoin");
	assert.equal(mesh.calls[0].parameters.radiusTop, 0.31);
	assert.equal(mesh.calls[0].parameters.radiusBottom, 0.31);
	assert.equal(mesh.calls[0].parameters.height, 0.075);
	assert.equal(mesh.calls[0].parameters.radialSegments, 12);
	assert.deepEqual(mesh.calls[0].rotation, [Math.PI / 2, 0, 0]);
	assert.equal(peruta.userData.kind, "peruta");
	assert.equal(peruta.userData.value, 1);
	assert.equal(peruta.userData.requiredAction, "normal");
	assert.equal(peruta.visible, false);
});

test("peruta configure and animation preserve reward semantics", () => {
	const mesh = createMeshFactory();
	const factory = new MamonCollectibleFactory(mesh.factory);
	const peruta = factory.create();
	factory.configure(peruta, {
		value: 7,
		action: "jump",
		y: 1.7,
		rare: true
	});
	assert.equal(peruta.userData.value, 7);
	assert.equal(peruta.userData.requiredAction, "jump");
	assert.equal(peruta.userData.baseY, 1.7);
	assert.equal(peruta.userData.collected, false);
	assert.equal(peruta.userData.rare, true);
	assert.equal(peruta.visible, true);
	assert.equal(peruta.scale.x, 1.28);
	assert.equal(peruta.scale.y, 1.28);
	assert.equal(peruta.scale.z, 1.28);
	factory.animate(peruta, 0.5, 0.25);
	const yaw = 0.5 * 3.4 + 0.25;
	assert.equal(peruta.quaternion.y, Math.sin(yaw / 2));
	assert.equal(peruta.quaternion.w, Math.cos(yaw / 2));
	assert.equal(peruta.position.y, 1.7 + Math.sin(0.5 * 4.1 + 0.25) * 0.08);
});
