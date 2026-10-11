// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseCatalog.js
 * @description The player universe-creation vocabulary: structures, nature, characters,
 * mission beacons, sky presets, terrain brushes, and starter universe templates.
 * Yaakov 2026-10-11: every player must be able to create their own hyperrealistic
 * universe and everything in it — terrain, sky, structures, characters, missions.
 * Data-first like the builder catalog: UI, economy, physics, sharing, and Studio
 * read one truth. Renderer-specific state never lives here.
 */

function makeUniversePart(id, label, icon, itemId, color, size, shape, options = {}) {
	return Object.freeze({
		category: options.category || 'structures',
		color,
		cost: options.cost ?? 1,
		icon,
		id,
		itemId,
		label,
		shape,
		size: Object.freeze({ ...size }),
		walkable: options.walkable ?? false,
		roughness: options.roughness ?? 0.85,
		metalness: options.metalness ?? 0.0,
		description: options.description || ''
	});
}

const STRUCTURES = Object.freeze([
	makeUniversePart('sukkah', 'Sukkah', '🌿', 'sukkah-kit', '#7a5c3e', { x: 3, y: 2.6, z: 3 }, 'sukkah', {
		description: 'Walls of timber, roof of sechach. Build it for the chag.', roughness: 0.9
	}),
	makeUniversePart('timber-house', 'Timber house', '🏠', 'timber-house-kit', '#8d6a45', { x: 5, y: 3.4, z: 4.2 }, 'house', {
		description: 'A warm wooden home with a pitched roof.', roughness: 0.85
	}),
	makeUniversePart('stone-house', 'Stone house', '🏚', 'stone-house-kit', '#767b80', { x: 5, y: 3.2, z: 4.2 }, 'house', {
		description: 'Cool hewn stone, built to outlast generations.', roughness: 0.95
	}),
	makeUniversePart('beis-medrash', 'Beis medrash', '📖', 'beis-medrash-kit', '#a08c5a', { x: 7, y: 4.2, z: 6 }, 'hall', {
		description: 'A house of study with tall windows and long tables.', roughness: 0.8
	}),
	makeUniversePart('watchtower', 'Watchtower', '🗼', 'watchtower-kit', '#6e5840', { x: 2.6, y: 7, z: 2.6 }, 'tower', {
		description: 'See the whole valley from the top.', roughness: 0.9
	}),
	makeUniversePart('bridge', 'Bridge', '🌉', 'bridge-kit', '#7d6248', { x: 6, y: 1.2, z: 2.4 }, 'bridge', {
		walkable: true, description: 'Span rivers and ravines.', roughness: 0.85
	}),
	makeUniversePart('fence-run', 'Fence run', '🪨', 'fence-kit', '#6b5138', { x: 4, y: 1.1, z: 0.25 }, 'fence', {
		description: 'Mark a boundary or pen the flock.', roughness: 0.9
	}),
	makeUniversePart('village-well', 'Village well', '🪣', 'well-kit', '#8a8f94', { x: 1.8, y: 1.6, z: 1.8 }, 'well', {
		description: 'Draw living waters.', roughness: 0.95
	}),
	makeUniversePart('stone-arch', 'Stone arch', '⛩', 'arch-kit', '#7f848a', { x: 3.4, y: 3.6, z: 1.2 }, 'arch', {
		description: 'A gate of hewn stone.', roughness: 0.95
	}),
	makeUniversePart('tent', 'Traveler tent', '⛺', 'tent-kit', '#b09a6e', { x: 3, y: 2.2, z: 3 }, 'tent', {
		description: 'Shelter for the road.', roughness: 0.92
	}),
	makeUniversePart('timber-wall', 'Timber wall', '🪵', 'wood-log', '#8d6a45', { x: 2, y: 2, z: 0.45 }, 'box', {
		description: 'One wall segment.', roughness: 0.9
	}),
	makeUniversePart('stone-platform', 'Stone platform', '🪨', 'stone-block', '#767b80', { x: 2.4, y: 0.45, z: 2.4 }, 'box', {
		walkable: true, description: 'A flat building pad.', roughness: 0.95
	}),
	makeUniversePart('glass-panel', 'Glass panel', '◇', 'glass-pane', '#8ed8e8', { x: 2, y: 2, z: 0.22 }, 'box', {
		description: 'Let the light in.', roughness: 0.15, metalness: 0.0
	}),
	makeUniversePart('brass-beam', 'Brass beam', '⚙', 'brass-brace', '#b88a3d', { x: 3, y: 0.34, z: 0.34 }, 'box', {
		walkable: true, description: 'Strong and bright.', roughness: 0.35, metalness: 0.9
	}),
	makeUniversePart('course-marker', 'Course marker', '🚩', 'course-marker', '#e36b52', { x: 0.65, y: 1.5, z: 0.65 }, 'box', {
		description: 'Mark an obstacle-course waypoint.', roughness: 0.8
	})
]);

const NATURE = Object.freeze([
	makeUniversePart('oak-tree', 'Oak tree', '🌳', 'oak-sapling', '#3f6b2f', { x: 2.2, y: 5.5, z: 2.2 }, 'tree', {
		category: 'nature', description: 'Broad shade for a hot afternoon.', roughness: 0.95
	}),
	makeUniversePart('pine-tree', 'Pine tree', '🌲', 'pine-sapling', '#2c5230', { x: 1.8, y: 6.5, z: 1.8 }, 'tree', {
		category: 'nature', description: 'Tall and straight as a tzaddik.', roughness: 0.95
	}),
	makeUniversePart('palm-tree', 'Palm tree', '🌴', 'palm-sapling', '#4a7038', { x: 2.0, y: 6.0, z: 2.0 }, 'tree', {
		category: 'nature', description: 'A taste of the midbar.', roughness: 0.95
	}),
	makeUniversePart('flower-patch', 'Flower patch', '🌸', 'flower-seeds', '#c96a8a', { x: 1.6, y: 0.5, z: 1.6 }, 'patch', {
		category: 'nature', description: 'Color for the meadow.', roughness: 0.9
	}),
	makeUniversePart('boulder', 'Boulder', '🪨', 'boulder', '#6f747a', { x: 1.8, y: 1.4, z: 1.8 }, 'rock', {
		category: 'nature', description: 'Ancient stone, unmoved.', roughness: 0.98
	}),
	makeUniversePart('bush', 'Bush', '🌿', 'bush-cutting', '#3a6132', { x: 1.4, y: 1.0, z: 1.4 }, 'bush', {
		category: 'nature', description: 'Green and low.', roughness: 0.95
	})
]);

const CHARACTERS = Object.freeze([
	makeUniversePart('chossid-npc', 'Chossid', '🧔', 'chossid-call', '#3a3f4a', { x: 0.7, y: 1.8, z: 0.7 }, 'npc', {
		category: 'characters', cost: 5, description: 'A fellow traveler who walks the roads.', roughness: 0.85
	}),
	makeUniversePart('villager-npc', 'Villager', '👩', 'villager-call', '#5a4a5a', { x: 0.7, y: 1.7, z: 0.7 }, 'npc', {
		category: 'characters', cost: 5, description: 'Lives in the village, full of stories.', roughness: 0.85
	}),
	makeUniversePart('sheep', 'Sheep', '🐑', 'sheep-call', '#ddd8cc', { x: 1.0, y: 0.9, z: 1.4 }, 'animal', {
		category: 'characters', cost: 3, description: 'Gentle flock animal.', roughness: 0.98
	}),
	makeUniversePart('horse', 'Horse', '🐎', 'horse-call', '#6b4a2e', { x: 1.0, y: 1.9, z: 2.4 }, 'animal', {
		category: 'characters', cost: 8, description: 'Swift and strong.', roughness: 0.8
	})
]);

const MISSION_BEACONS = Object.freeze([
	makeUniversePart('mission-beacon', 'Mission beacon', '✨', 'mission-scroll', '#f7d774', { x: 1.0, y: 2.4, z: 1.0 }, 'beacon', {
		category: 'missions', cost: 2, description: 'Anchor a player-authored mission here.', roughness: 0.4, metalness: 0.3
	})
]);

const SKY_PRESETS = Object.freeze([
	{ id: 'dawn', label: 'Dawn', icon: '🌅' },
	{ id: 'morning', label: 'Morning', icon: '🌤' },
	{ id: 'noon', label: 'Noon', icon: '☀️' },
	{ id: 'golden', label: 'Golden hour', icon: '🌇' },
	{ id: 'dusk', label: 'Dusk', icon: '🌆' },
	{ id: 'night', label: 'Night', icon: '🌙' },
	{ id: 'storm', label: 'Storm', icon: '⛈' }
]);

const TERRAIN_BRUSHES = Object.freeze([
	{ id: 'raise', label: 'Raise land', icon: '⛰', description: 'Lift the earth into a hill.' },
	{ id: 'lower', label: 'Lower land', icon: '🕳', description: 'Carve a valley or pond basin.' },
	{ id: 'flatten', label: 'Flatten', icon: '🟫', description: 'Level ground for building.' },
	{ id: 'smooth', label: 'Smooth', icon: '〰', description: 'Soften rough terrain.' }
]);

const UNIVERSE_TEMPLATES = Object.freeze([
	{
		id: 'meadow',
		label: 'Green meadow',
		icon: '🌱',
		description: 'Rolling grass, oaks, a village well, golden afternoon.',
		sky: 'golden',
		seedParts: ['oak-tree', 'oak-tree', 'pine-tree', 'flower-patch', 'village-well', 'fence-run']
	},
	{
		id: 'desert',
		label: 'Desert camp',
		icon: '🏜',
		description: 'Sandy ground, palms, tents, hard noon light.',
		sky: 'noon',
		seedParts: ['palm-tree', 'palm-tree', 'tent', 'tent', 'boulder', 'village-well']
	},
	{
		id: 'alpine',
		label: 'Alpine valley',
		icon: '🏔',
		description: 'Pines, boulders, a bridge over the stream, crisp morning.',
		sky: 'morning',
		seedParts: ['pine-tree', 'pine-tree', 'pine-tree', 'boulder', 'bridge', 'flower-patch']
	},
	{
		id: 'night-village',
		label: 'Night village',
		icon: '🌃',
		description: 'Stone houses, watchtower, beacons lit under the stars.',
		sky: 'night',
		seedParts: ['stone-house', 'stone-house', 'watchtower', 'mission-beacon', 'fence-run', 'bush']
	}
]);

const ALL_PARTS = Object.freeze([...STRUCTURES, ...NATURE, ...CHARACTERS, ...MISSION_BEACONS]);

/** Returns every universe part across all categories. */
export function universeCatalog() {
	return ALL_PARTS;
}

/** Returns universe parts filtered to one category id. */
export function universeCatalogByCategory(category) {
	return ALL_PARTS.filter(part => part.category === category);
}

/** Returns the stable universe category ids in presentation order. */
export function universeCategories() {
	return ['structures', 'nature', 'characters', 'missions'];
}

/** Resolves one universe part or throws a deterministic domain error. */
export function universePart(id) {
	const part = ALL_PARTS.find(candidate => candidate.id === id);
	if (!part) throw new Error(`UNIVERSE_PART_UNKNOWN:${id}`);
	return part;
}

/** Returns the sky presets players can choose for their universe. */
export function universeSkyPresets() {
	return SKY_PRESETS;
}

/** Returns the terrain brushes players can sculpt with. */
export function universeTerrainBrushes() {
	return TERRAIN_BRUSHES;
}

/** Returns the starter universe templates. */
export function universeTemplates() {
	return UNIVERSE_TEMPLATES;
}

/** Resolves one universe template or throws a deterministic domain error. */
export function universeTemplate(id) {
	const template = UNIVERSE_TEMPLATES.find(candidate => candidate.id === id);
	if (!template) throw new Error(`UNIVERSE_TEMPLATE_UNKNOWN:${id}`);
	return template;
}
