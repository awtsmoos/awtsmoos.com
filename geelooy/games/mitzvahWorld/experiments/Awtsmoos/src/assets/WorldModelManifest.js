// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldModelManifest.js
 * @description Preserves optional non-tree imported model roles, placements, budgets, and immutable remote truth.
 * The Awtsmoos lets creature, tool, flower, bush, and stone retain finite identity while Awtsmoos.com
 * excludes every structural tree because the canonical deep procedural forest alone owns trunk, branch, canopy, and species.
 */

import { remoteModelRecord } from './RemoteModelCatalog.js';

export const WORLD_MODEL_MANIFEST = Object.freeze({
	'flower-clump': model('Flower_4_Clump.glb', 'flora', false, 4),
	'flower-bush': model('Bush_Large_Flowers.glb', 'flora', false, 3),
	'river-rock': model('Rock_2.glb', 'terrain', false, 4),
	'axe-small': model('Axe_Small.glb', 'tool', false, 1),
	'wooden-staff': model('WoodenStaff.glb', 'weapon', false, 1),
	'sword': model('Sword.glb', 'weapon', false, 1),
	'shield': model('Shield.glb', 'shield', false, 1),
	'book': model('Book.glb', 'book', false, 2),
	'scroll': model('Scroll.glb', 'quest', false, 2),
	'chest': model('Chest_Closed.glb', 'prop', false, 2),
	'snake': model('Snake.glb', 'wildlife', true, 2, ['Snake_Attack', 'Snake_Death', 'Snake_Idle', 'Snake_Jump', 'Snake_Walk']),
	'snake-angry': model('Snake_Angry.glb', 'wildlife', true, 1, ['Snake_Attack', 'Snake_Idle', 'Snake_Walk']),
	'cow': model('Cow.glb', 'livestock', true, 2),
	'sheep': model('Sheep.glb', 'livestock', true, 2),
	'rat': model('Rat.glb', 'wildlife', true, 2),
	'spider': model('Spider.glb', 'wildlife', true, 2)
});

export const WORLD_MODEL_PLACEMENTS = Object.freeze([
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

export const WORLD_MODEL_GROUPS = Object.freeze({
	nature: Object.freeze(['flower-clump', 'flower-bush', 'river-rock']),
	village: Object.freeze(['axe-small', 'wooden-staff', 'sword', 'shield', 'book', 'scroll', 'chest']),
	wildlife: Object.freeze(['snake', 'snake-angry', 'cow', 'sheep', 'rat', 'spider'])
});

export function worldModelDefinition(modelId) {
	return WORLD_MODEL_MANIFEST[modelId] || null;
}

export function worldModelManifestEvidence() {
	const definitions = Object.values(WORLD_MODEL_MANIFEST);
	return Object.freeze({
		bytes: definitions.reduce((sum, item) => sum + item.bytes, 0),
		models: definitions.length,
		remoteOnly: definitions.every(item => item.url.startsWith('https://awtsmoos.com/sites/firebase_drive_migration/')),
		structuralTreeAuthority: 'awtsmoos-procedural-core',
		structuralTreeModels: 0
	});
}

function model(file, role, animated, maximumInstances, clips = []) {
	const record = remoteModelRecord(`reference-world/${file}`);
	return Object.freeze({
		animated,
		bytes: record.bytes,
		clips: Object.freeze(clips),
		file,
		maximumInstances,
		provenance: 'Authenticated Awtsmoos Drive upload; source license metadata not located',
		role,
		sha256: record.sha256,
		url: record.url
	});
}

function placement(modelId, x, z, scale, yaw) {
	return Object.freeze({ modelId, position: Object.freeze({ x, z }), scale, yaw });
}
