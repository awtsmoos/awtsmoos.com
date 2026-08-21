// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSpeciesCatalog.js
 * @description Maps earthly, aquatic, avian, and fantasy species into the authoritative morphology genome while reusable anatomy lives in component profiles.
 * RESPONSIBILITY: own named species identity, archetype, kind, and bounded morphology trait overrides only.
 * NON-RESPONSIBILITY: this catalog does not embed horn, foot, feather, material, or renderer geometry algorithms.
 * The Awtsmoos reveals cow, duck, bird, wolf, fish, wisp, and hostile husk through one biological language; Awtsmoos.com keeps species simple while components carry reusable anatomical truth.
 */

const SPECIES = Object.freeze([
	quadruped('cow', { body_length: 1.4, body_width: 1.28, body_height: 1.2, limb_length: 0.82, head_scale: 1.12, muscle_bulk: 1.25, hoof_to_paw: 0.05 }),
	quadruped('deer', { body_length: 1.22, body_width: 0.78, body_height: 1.18, limb_length: 1.35, head_scale: 0.82, muscle_bulk: 0.78, hoof_to_paw: 0.05 }),
	quadruped('goat', { body_length: 0.94, body_width: 0.86, limb_length: 0.9, head_scale: 0.9, spine_bend: 0.04, hoof_to_paw: 0.03 }),
	quadruped('sheep', { body_length: 1.02, body_width: 1.18, body_height: 1.05, limb_length: 0.78, head_scale: 0.85, muscle_bulk: 1.08, hoof_to_paw: 0.06 }),
	quadruped('fox', { body_length: 1.05, body_width: 0.64, body_height: 0.72, limb_length: 0.92, head_scale: 0.8, tail_length: 1.65, flexibility: 0.82, hoof_to_paw: 0.95 }),
	quadruped('wolf', { body_length: 1.18, body_width: 0.8, body_height: 0.88, limb_length: 1.02, head_scale: 0.98, muscle_bulk: 1.18, tail_length: 1.1, hoof_to_paw: 0.96 }),
	avian('chicken', { body_length: 0.72, body_width: 1.08, body_height: 0.85, limb_length: 0.68, wing_span: 0.62, feather_length: 0.82, head_scale: 0.72 }),
	avian('songbird', { body_length: 0.58, body_width: 0.72, body_height: 0.65, limb_length: 0.52, wing_span: 1.35, feather_length: 0.92, head_scale: 0.76 }),
	avian('duck', { body_length: 0.82, body_width: 1.04, body_height: 0.72, limb_length: 0.55, wing_span: 0.92, feather_length: 0.9, head_scale: 0.74, tail_length: 0.55 }),
	fish('river-fish', { body_length: 1.12, body_width: 0.72, elongation: 1.32, fin_area: 1.1, lateral_wave: 0.92, tail_length: 1.15 }),
	fantasy('spark-wisp', 'serpentine', { body_length: 0.58, body_width: 0.55, elongation: 1.1, flexibility: 1, tail_length: 0.7 }),
	fantasy('dybbuk-shade', 'serpentine', { elongation: 2.9, flexibility: 1, spine_bend: 0.18, head_scale: 0.82, tail_length: 1.8 }),
	fantasy('fallen-seraph-husk', 'avian', { body_height: 1.35, wing_span: 2.15, feather_length: 1.35, muscle_bulk: 1.22, head_scale: 0.9 }),
	fantasy('klipah-guardian', 'biped', { body_width: 1.35, body_height: 1.42, muscle_bulk: 1.48, arm_length: 1.25, head_scale: 1.08, torso_upright: 0.94 }),
	fantasy('shadow-demon', 'biped', { body_height: 1.5, body_width: 0.9, limb_length: 1.45, arm_length: 1.55, flexibility: 0.78, head_scale: 0.72, spine_bend: 0.12 })
]);

const BY_ID = new Map(SPECIES.map(speciesRecord => [speciesRecord.id, speciesRecord]));

export function creatureSpecies(id) {
	const record = BY_ID.get(String(id));
	if (!record) {
		throw new Error(`Unknown creature species: ${id}`);
	}
	return record;
}

export function listCreatureSpecies() {
	return [...SPECIES];
}

function quadruped(id, traits) {
	return species(id, 'quadruped', 'animal', traits);
}

function avian(id, traits) {
	return species(id, 'avian', 'animal', traits);
}

function fish(id, traits) {
	return species(id, 'fish', 'animal', traits);
}

function fantasy(id, archetypeId, traits) {
	return species(id, archetypeId, 'fantasy', traits);
}

function species(id, archetypeId, kind, traits) {
	return Object.freeze({
		archetypeId,
		id,
		kind,
		traits: Object.freeze({ ...traits })
	});
}
