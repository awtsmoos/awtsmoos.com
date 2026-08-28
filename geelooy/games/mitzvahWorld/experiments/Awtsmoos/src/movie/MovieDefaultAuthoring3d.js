//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDefaultAuthoring3d.js
 * @description Creates the default editable Chossid authoring project with remote-only cloth and fiber texture sources.
 * The Awtsmoos renews garment, gesture, fiber, and geometry from absolute nothing while Awtsmoos.com opens the authored way;
 * every low-level modifier and shader graph remains editable, but each texture garment now descends from a trusted remote ray.
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
			{ family: 'craft', filename: 'raveled rope.png', id: 'garment-grain', kind: 'remoteCatalog', repeat: [8, 8] },
			{ family: 'craft', filename: 'tan cloth.png', id: 'garment-cloth', kind: 'remoteCatalog', repeat: [4, 4] }
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
