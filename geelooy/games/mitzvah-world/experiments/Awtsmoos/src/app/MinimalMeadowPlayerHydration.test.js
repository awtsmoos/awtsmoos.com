// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.test.js
 * @description Proves the player hydration installs the simple world's own
 * friendly neighbors when the post-playable chain never fires — and never
 * installs them in a rich world, and never lets their failure break the
 * player receipt. The Awtsmoos lets the meadow's Chossidim arrive with the
 * traveler; Awtsmoos.com keeps first control honest when the later chain
 * stalls.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { Bone } from '../../../light-three-gltf/tiny-runtime.js';
import { Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { hydrateMinimalMeadowPlayer } from './MinimalMeadowPlayerHydration.js';

function fakeHeadNode() {
	const head = new Bone();
	head.name = 'mixamorig:Head';
	return head;
}

function fakeClip(headNode) {
	return {
		channels: [{
			input: new Float32Array([0, 2]),
			interpolation: 'LINEAR',
			node: headNode,
			output: new Float32Array([1, 1, 1, 1, 1, 1]),
			path: 'scale',
			size: 3
		}],
		duration: 2,
		name: 'stand_Armature'
	};
}

function fakeGltf() {
	const head = fakeHeadNode();
	const scene = new Group();
	scene.add(head);
	const mesh = new Mesh(
		{ attributes: { position: { array: new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 1]) } } },
		{
			baseColorFactor: new Float32Array([0.13, 0.14, 0.17, 1]),
			color: { r: 0.13, g: 0.14, b: 0.17, setHex() {} },
			name: 'jacket@#23252b',
			needsUpdate: false,
			roughness: 1
		}
	);
	mesh.name = 'jacket-mesh';
	scene.add(mesh);
	return {
		animations: [fakeClip(head)],
		head,
		scene
	};
}

function fakeRuntime(worldExperience) {
	const children = [];
	const scene = {
		add(object) {
			children.push(object);
		},
		traverse(fn) {
			for (const child of [...children]) fn(child);
		},
		updateWorldMatrix() {}
	};
	return {
		canonicalPlayer: null,
		canonicalPlayerPromise: null,
		destroyed: false,
		scene,
		state: { facing: 0, x: 0, y: 0, z: 0 },
		worldExperience
	};
}

function fakeEnvironment() {
	return {
		AwtsmoosDiagnostics: {},
		document: { querySelector() { return null; } }
	};
}

test('the hydration installs friendly neighbors on a simple world', async () => {
	const gltf = fakeGltf();
	const runtime = fakeRuntime({ canonicalPromotion: false, id: 'blank-meadow' });
	const environment = fakeEnvironment();
	let installed = 0;
	const receipt = await hydrateMinimalMeadowPlayer(runtime, environment, {
		loadGltf: async () => gltf,
		waitForVisualRenderer: async () => true,
		installSimpleWorldFriendlyNpcs: async () => {
			installed += 1;
			return { ready: true };
		}
	});
	assert.equal(receipt.status, 'ready');
	assert.equal(installed, 1);
	assert.ok(gltf.animations[0].channels[0].output.every(value => Math.abs(value - 0.88) < 1e-6));
});

test('the hydration never installs friendly neighbors in a rich world', async () => {
	const gltf = fakeGltf();
	const runtime = fakeRuntime({ canonicalPromotion: true, id: 'living-village' });
	const environment = fakeEnvironment();
	let installed = 0;
	const receipt = await hydrateMinimalMeadowPlayer(runtime, environment, {
		loadGltf: async () => gltf,
		waitForVisualRenderer: async () => true,
		installSimpleWorldFriendlyNpcs: async () => {
			installed += 1;
			return { ready: true };
		}
	});
	assert.equal(receipt.status, 'ready');
	assert.equal(installed, 0);
});

test('a failing friendly install never breaks the player receipt', async () => {
	const gltf = fakeGltf();
	const runtime = fakeRuntime({ canonicalPromotion: false, id: 'blank-meadow' });
	const environment = fakeEnvironment();
	const receipt = await hydrateMinimalMeadowPlayer(runtime, environment, {
		loadGltf: async () => gltf,
		waitForVisualRenderer: async () => true,
		installSimpleWorldFriendlyNpcs: async () => {
			throw new Error('friendly neighbors failed');
		}
	});
	assert.equal(receipt.status, 'ready');
});
