// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicVillageLayout
 * @description
 * Houses, trees, paths, lamps, and one walking character emerge from stable seeds
 * so API calls, UI buttons, undo, export, and rendering always reveal the same world.
 */

export function createCinematicVillageLayout(seed = 613) {
	return {
		character: createCharacterPath(),
		houses: createVillageHouses(),
		lamps: createLamps(),
		paths: createVillagePaths(),
		trees: createTreeGrove({ centerX: 0, centerZ: -8, count: 64, radius: 46, seed })
	};
}

export function createVillageHouse(options = {}) {
	const index = Number(options.index || 0);
	return {
		depth: Number(options.depth || 7 + index % 3),
		height: Number(options.height || 6 + index % 2),
		id: String(options.id || `house-${index + 1}`),
		roofHeight: Number(options.roofHeight || 3),
		roofMaterial: String(options.roofMaterial || 'material-roof'),
		wallMaterial: String(options.wallMaterial || 'material-plaster'),
		width: Number(options.width || 9 + index % 4),
		windowMaterial: 'material-window',
		x: Number(options.x || 0),
		z: Number(options.z || 0)
	};
}

export function createTreeGrove({ centerX = 0, centerZ = 0, count = 24, radius = 22, seed = 613 } = {}) {
	return Array.from({ length: Math.max(1, Math.min(160, Number(count))) }, (_, index) => {
		const angle = random(seed, index, 1) * Math.PI * 2;
		const distance = radius * (0.42 + random(seed, index, 2) * 0.58);
		return {
			id: `tree-${seed}-${index + 1}`,
			leafMaterial: 'material-leaves',
			scale: 0.75 + random(seed, index, 3) * 1.2,
			trunkMaterial: 'material-wood',
			x: centerX + Math.cos(angle) * distance,
			z: centerZ + Math.sin(angle) * distance
		};
	});
}

function createVillageHouses() {
	const points = [[-24,-14],[-11,-19],[5,-20],[20,-14],[-28,2],[-14,5],[13,4],[28,0],[-20,20],[0,22],[21,18]];
	return points.map(([x, z], index) => createVillageHouse({ index, x, z }));
}

function createVillagePaths() {
	return [
		{ from: [-42, 28], id: 'main-stone-road', material: 'material-wet-stone', to: [35, -26], width: 6 },
		{ from: [-28, 2], id: 'market-lane', material: 'material-wet-stone', to: [28, 0], width: 4 },
		{ from: [0, 22], id: 'house-path', material: 'material-wet-stone', to: [4, -20], width: 3 }
	];
}

function createCharacterPath() {
	return {
		bodyMaterial: 'material-coat',
		hatMaterial: 'material-coat',
		id: 'hero-chossid',
		path: [
			{ t: 0, x: -38, z: 26 },
			{ t: 0.28, x: -18, z: 12 },
			{ t: 0.5, x: -4, z: 2 },
			{ t: 0.72, x: 10, z: -9 },
			{ t: 1, x: 23, z: -18 }
		]
	};
}

function createLamps() {
	return [-24, -8, 8, 24].map((x, index) => ({ id: `lamp-${index + 1}`, x, z: 1 - index * 3 }));
}

function random(seed, index, channel) {
	const value = Math.sin(seed * 12.9898 + index * 78.233 + channel * 37.719) * 43758.5453;
	return value - Math.floor(value);
}
