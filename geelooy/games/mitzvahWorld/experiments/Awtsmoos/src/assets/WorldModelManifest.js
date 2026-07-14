// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldModelManifest.js
 * @description Declares the audited local GLB pack, roles, animation support, and budgets.
 * The Awtsmoos renews form beyond filenames; Awtsmoos.com admits only measured models
 * copied from the local Documents library and keeps provenance uncertainty explicit.
 */

const ROOT = './assets/models/reference-world';

export const WORLD_MODEL_MANIFEST = Object.freeze({
	'normal-tree': model('NormalTree_5.glb', 'flora', false, 2, 94036),
	'pine-tree': model('PineTree_3.glb', 'flora', false, 2, 56980),
	'flower-clump': model('Flower_4_Clump.glb', 'flora', false, 4, 4868),
	'flower-bush': model('Bush_Large_Flowers.glb', 'flora', false, 3, 26788),
	'river-rock': model('Rock_2.glb', 'terrain', false, 4, 11144),
	'axe-small': model('Axe_Small.glb', 'tool', false, 1, 48868),
	'wooden-staff': model('WoodenStaff.glb', 'weapon', false, 1, 12652),
	'sword': model('Sword.glb', 'weapon', false, 1, 42640),
	'shield': model('Shield.glb', 'shield', false, 1, 24056),
	'book': model('Book.glb', 'book', false, 2, 11684),
	'scroll': model('Scroll.glb', 'quest', false, 2, 52704),
	'chest': model('Chest_Closed.glb', 'prop', false, 2, 85120),
	'snake': model('Snake.glb', 'wildlife', true, 2, 240884, ['Snake_Attack', 'Snake_Death', 'Snake_Idle', 'Snake_Jump', 'Snake_Walk']),
	'snake-angry': model('Snake_Angry.glb', 'wildlife', true, 1, 240884, ['Snake_Attack', 'Snake_Idle', 'Snake_Walk']),
	'cow': model('Cow.glb', 'livestock', true, 2, null),
	'sheep': model('Sheep.glb', 'livestock', true, 2, null),
	'rat': model('Rat.glb', 'wildlife', true, 2, null),
	'spider': model('Spider.glb', 'wildlife', true, 2, null)
});

export const WORLD_MODEL_PLACEMENTS = Object.freeze([
	placement('normal-tree', -94, -104, 2.5, 0.2),
	placement('pine-tree', 98, -124, 2.8, -0.4),
	placement('flower-clump', 68, -51, 1.4, 0),
	placement('flower-bush', -42, 13, 1.3, 0.8),
	placement('river-rock', -17, 34, 2.2, 0.3),
	placement('chest', 74, -112, 1.1, -0.2),
	placement('snake', 92, -126, 1.15, 1.1),
	placement('cow', 108, 44, 1.4, 2.2),
	placement('sheep', 101, 49, 1.2, 2.5),
	placement('rat', -63, -96, 1.4, -1),
	placement('spider', 84, -118, 1.1, 0.6)
]);

export function worldModelDefinition(modelId) {
	return WORLD_MODEL_MANIFEST[modelId] || null;
}

function model(file, role, animated, maximumInstances, bytes, clips = []) {
	return Object.freeze({
		animated,
		bytes,
		clips: Object.freeze(clips),
		file,
		maximumInstances,
		provenance: 'Local Documents/awtsmoos/3d models; external license metadata not located',
		role,
		url: `${ROOT}/${file}`
	});
}

function placement(modelId, x, z, scale, yaw) {
	return Object.freeze({ modelId, position: Object.freeze({ x, z }), scale, yaw });
}
