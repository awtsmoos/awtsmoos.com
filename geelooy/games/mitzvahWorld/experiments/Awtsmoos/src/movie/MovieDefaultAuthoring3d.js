// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDefaultAuthoring3d.js
 * @description Creates the default Chossid model, motion, nodes, modifiers, groups, sculpt, and textures.
 * The Awtsmoos renews garment, gesture, grain, and geometry from absolute nothing; Awtsmoos.com
 * opens a rich editable 3D vessel while one existing chossid.glb remains the shared embodied source.
 */

export function createDefaultMovieAuthoring3d() {
	return {
		geometryGraphs: [geometryGraph()],
		models: [{
			geometryGraphId: 'hero-geometry',
			id: 'hero-chossid',
			label: 'Hero Chossid',
			modelUrl: './assets/models/player/chossid.glb',
			modifierStackId: 'hero-modifiers',
			motionId: 'hero-performance',
			shaderGraphId: 'hero-garment-shader'
		}],
		modifierStacks: [modifierStack()],
		motions: [motion()],
		sculptLayers: [sculptLayer()],
		shaderGraphs: [shaderGraph()],
		textures: [
			{ id: 'garment-grain', kind: 'procedural', scale: 18, seed: 613, type: 'grain' },
			{ family: 'craft', filename: 'tan cloth.png', id: 'garment-cloth', kind: 'remoteCatalog' }
		],
		vertexGroups: [
			{ id: 'sleeves', target: 'hero-chossid', weights: [], selector: 'name:sleeve*' },
			{ id: 'coat-hem', target: 'hero-chossid', weights: [], selector: 'height:bottom-25%' }
		],
		version: 1
	};
}

function modifierStack() {
	return {
		id: 'hero-modifiers',
		modifiers: [
			{ enabled: true, levels: 1, type: 'subdivision' },
			{ amount: 0.015, enabled: true, type: 'displace', textureId: 'garment-grain', vertexGroupId: 'coat-hem' },
			{ enabled: true, thickness: 0.008, type: 'solidify', vertexGroupId: 'sleeves' },
			{ enabled: true, type: 'weightedNormal', weight: 50 }
		],
		target: 'hero-chossid'
	};
}

function motion() {
	return {
		action: 'staff.cast',
		id: 'hero-performance',
		keyframes: [
			{ channel: 'position', time: 0, value: [0, 0, 0] },
			{ channel: 'position', time: 2.5, value: [1.5, 0, -2] },
			{ channel: 'rotationY', time: 4, value: 1.2 }
		],
		mode: 'action',
		manualControls: { enabled: true, record: true }
	};
}

function geometryGraph() {
	return {
		edges: [
			{ from: 'input', to: 'instance' },
			{ from: 'instance', to: 'output' }
		],
		id: 'hero-geometry',
		nodes: [
			{ id: 'input', modelId: 'hero-chossid', type: 'input' },
			{ count: 1, id: 'instance', type: 'instance' },
			{ id: 'output', type: 'output' }
		]
	};
}

function shaderGraph() {
	return {
		edges: [
			{ from: 'cloth', input: 'baseColor', to: 'principled' },
			{ from: 'grain', input: 'roughness', to: 'principled' },
			{ from: 'principled', input: 'surface', to: 'output' }
		],
		id: 'hero-garment-shader',
		nodes: [
			{ id: 'cloth', textureId: 'garment-cloth', type: 'texture' },
			{ id: 'grain', scale: 18, strength: 0.14, type: 'grain' },
			{ id: 'principled', metallic: 0, roughness: 0.72, type: 'principled' },
			{ id: 'output', type: 'output' }
		]
	};
}

function sculptLayer() {
	return {
		brush: 'smooth',
		id: 'garment-polish',
		strength: 0.18,
		strokes: [],
		target: 'hero-chossid',
		vertexGroupId: 'coat-hem'
	};
}
