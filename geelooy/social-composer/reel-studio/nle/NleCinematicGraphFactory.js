// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicGraphFactory
 * @description
 * Material, atmosphere, and particle intentions become bounded node documents that
 * canonical compilation and the WebGL preview can both consume deterministically.
 */

export function createCinematicGraphSet(seed = 613) {
	return {
		graphs: [
			createShaderGraph({ id: 'shader-village-dawn', label: 'Village dawn', seed }),
			createParticleGraph({ id: 'particles-fireflies', label: 'Golden fireflies', mode: 'fireflies', seed: seed + 17 }),
			createParticleGraph({ id: 'particles-mist', label: 'Ground mist', mode: 'mist', seed: seed + 29, count: 420, size: 7 })
		],
		materialGraphs: [
			createMaterialGraph({ color: '#45566a', id: 'material-wet-stone', label: 'Wet stone', roughness: 0.42 }),
			createMaterialGraph({ color: '#c7aa7c', id: 'material-plaster', label: 'Warm plaster', roughness: 0.78 }),
			createMaterialGraph({ color: '#5a2e21', id: 'material-roof', label: 'Clay roof', roughness: 0.68 }),
			createMaterialGraph({ color: '#5d3d24', id: 'material-wood', label: 'Old wood', roughness: 0.74 }),
			createMaterialGraph({ color: '#244d34', id: 'material-leaves', label: 'Deep leaves', roughness: 0.88 }),
			createMaterialGraph({ color: '#141820', id: 'material-coat', label: 'Wool coat', roughness: 0.91 }),
			createMaterialGraph({ color: '#f3c96d', emissive: '#f3ad4d', id: 'material-window', label: 'Window light', roughness: 0.2 })
		]
	};
}

export function createMaterialGraph({ color, emissive = null, id, label, roughness = 0.7 }) {
	return {
		edges: [{ from: `${id}-color`, input: 'base', to: `${id}-output` }],
		id,
		label,
		nodes: [
			{ id: `${id}-color`, type: 'color', value: color },
			{ id: `${id}-output`, type: 'output', value: { emissive, roughness } }
		]
	};
}

export function createShaderGraph({ id, label, seed = 613 }) {
	return graph(id, label, 'shader', {
		exposure: 1.08,
		fogColor: '#6c7d8f',
		fogDensity: 0.018,
		skyBottom: '#e0a761',
		skyTop: '#12263f',
		sunColor: '#ffd88a',
		vignette: 0.24,
		wind: 0.16,
		seed
	});
}

export function createParticleGraph({ count = 260, id, label, mode, seed, size = 5, speed = 0.55 }) {
	return graph(id, label, 'particle', {
		colors: mode === 'mist' ? ['#d6e4e8', '#91aab5'] : ['#ffd978', '#fff2b0'],
		count,
		mode,
		seed,
		size,
		speed
	});
}

function graph(id, label, kind, value) {
	return {
		edges: [],
		id,
		kind,
		label,
		nodes: [{ id: `${id}-output`, type: 'output', value }]
	};
}
