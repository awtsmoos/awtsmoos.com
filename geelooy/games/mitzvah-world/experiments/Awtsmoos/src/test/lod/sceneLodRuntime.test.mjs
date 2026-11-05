// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos distinguishes living essence from decorative garments; this contract proves
 * Awtsmoos.com hides only explicitly disposable static detail in the real tiny scene graph.
 */
import assert from 'node:assert/strict';
import { Mesh } from '../../../../light-three-gltf/tiny-mesh-object.js';
import { Scene } from '../../../../light-three-gltf/tiny-object3d.js';
import { SceneLodRuntime } from '../../lod/SceneLodRuntime.js';

const scene = new Scene();
const grass = mesh('yard-grass', 200, { AwtsmoosYardGrass: {} });
const vegetation = mesh('forest-leaves', 200, {
	AwtsmoosLod: { className: 'vegetation' }
});
const mountain = mesh('mountain', 200, {
	AwtsmoosLod: { className: 'mountain' }
});
const landmark = mesh('bridge', 200, {
	AwtsmoosLod: { className: 'landmark' }
});
const creature = mesh('goat', 200, {
	AwtsmoosLod: { className: 'creature' }
});
const building = mesh('cottage', 200, {
	AwtsmoosLod: { className: 'architecture' }
});
const hidden = mesh('hidden-grass', 200, { AwtsmoosYardGrass: {} });
hidden.visible = false;
const skinned = mesh('animated-grass', 200, { AwtsmoosYardGrass: {} });
skinned.isSkinnedMesh = true;
skinned.skeleton = {};
for (const item of [grass, vegetation, mountain, landmark, creature, building, hidden, skinned]) {
	scene.add(item);
}
const runtime = new SceneLodRuntime({ scene });
assert.equal(runtime.refresh(), 2, 'only static disposable detail should register');
assert.equal(runtime.refresh(), 0, 'unchanged nodes should never duplicate');
let diagnostics = runtime.diagnostics();
assert.equal(diagnostics.registered, 2);
assert.equal(diagnostics.byClass.grass.registered, 1);
assert.equal(diagnostics.byClass.vegetation.registered, 1);

const farContext = {
	position: { x: 0, y: 0, z: 0 },
	yaw: 0,
	tierName: 'high'
};
runtime.update(farContext);
assert.equal(grass.visible, false);
assert.equal(vegetation.visible, false);
for (const protectedNode of [mountain, landmark, creature, building]) {
	assert.equal(protectedNode.visible, true);
}
assert.equal(hidden.visible, false);
assert.equal(skinned.visible, true);
diagnostics = runtime.diagnostics();
assert.equal(diagnostics.hidden, 2);
assert.equal(diagnostics.hiddenTriangles, 2);

const streamed = mesh('streamed-lantern', 200, {
	AwtsmoosLod: { className: 'detail' }
});
scene.add(streamed);
assert.equal(runtime.refresh(), 1);
runtime.update(farContext);
assert.equal(streamed.visible, false, 'streamed detail should evaluate in the same camera cell');
diagnostics = runtime.diagnostics();
assert.equal(diagnostics.registered, 3);
assert.equal(diagnostics.hiddenTriangles, 3);
assert.equal(diagnostics.lastRefreshRegistrations, 1);

runtime.update({
	position: { x: 200, y: 0, z: 0 },
	yaw: 0,
	tierName: 'high'
});
for (const item of [grass, vegetation, streamed]) assert.equal(item.visible, true);
assert.equal(runtime.diagnostics().hidden, 0);
runtime.destroy();
for (const item of [grass, vegetation, streamed]) assert.equal(item.visible, true);
assert.equal(runtime.diagnostics().registered, 0);
console.log(JSON.stringify({
	ok: true,
	registrations: 3,
	protectedNodes: 4,
	finalDiagnostics: runtime.diagnostics()
}, null, 2));

function mesh(name, x, userData) {
	const item = new Mesh(triangleGeometry(), null);
	item.name = name;
	item.position.x = x;
	item.userData = userData;
	return item;
}

function triangleGeometry() {
	return {
		attributes: {
			position: {
				array: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
				count: 3,
				itemSize: 3
			}
		},
		index: null
	};
}
