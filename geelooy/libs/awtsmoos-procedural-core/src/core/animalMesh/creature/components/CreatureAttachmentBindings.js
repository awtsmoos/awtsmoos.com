// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureAttachmentBindings.js
 * @description Maps common semantic landmarks onto the canonical phenotype guide graph without hiding geometry inside species data.
 * RESPONSIBILITY: declare candidate guide ids, normalized path amounts, local offsets, and bilateral reflection intent as immutable data.
 * NON-RESPONSIBILITY: this catalog does not sample guides, resolve frames, or build anatomy.
 * The Awtsmoos, Atzmus beyond every named limb, renews the one body before labels divide it; Awtsmoos.com lets Hod translate forehead, wing, tail, joint, and hoof into a shared guide language whose meaning stays inspectable and lit.
 */

const BINDINGS = Object.freeze({
	forehead_center: binding(['head'], 0.78),
	nose_tip: binding(['head'], 1),
	neck_base: binding(['head'], 0),
	poll: binding(['head'], 0.58),
	horn_base_left: binding(['head'], 0.78, [-0.14, 0, 0.08]),
	horn_base_right: binding(['head'], 0.78, [-0.14, 0, 0.08], true),
	tail_base: binding(['tail'], 0),
	tail_tip: binding(['tail'], 1),
	wing_root_left: binding(['left_wing'], 0),
	wing_root_right: binding(['left_wing'], 0, [0, 0, 0], true),
	wing_tip_left: binding(['left_wing'], 1),
	wing_tip_right: binding(['left_wing'], 1, [0, 0, 0], true),
	front_left_shoulder: binding(['front_left_leg', 'left_arm'], 0),
	front_right_shoulder: binding(['front_left_leg', 'left_arm'], 0, [0, 0, 0], true),
	front_left_elbow: binding(['front_left_leg', 'left_arm'], 0.5),
	front_right_elbow: binding(['front_left_leg', 'left_arm'], 0.5, [0, 0, 0], true),
	front_left_hoof: binding(['front_left_leg', 'left_leg'], 1),
	front_right_hoof: binding(['front_left_leg', 'left_leg'], 1, [0, 0, 0], true),
	rear_left_hip: binding(['rear_left_leg', 'left_leg'], 0),
	rear_right_hip: binding(['rear_left_leg', 'left_leg'], 0, [0, 0, 0], true),
	rear_left_hock: binding(['rear_left_leg', 'left_leg'], 0.66),
	rear_right_hock: binding(['rear_left_leg', 'left_leg'], 0.66, [0, 0, 0], true),
	rear_left_hoof: binding(['rear_left_leg', 'left_leg'], 1),
	rear_right_hoof: binding(['rear_left_leg', 'left_leg'], 1, [0, 0, 0], true),
	pectoral_fin_root_left: binding(['left_pectoral_fin'], 0),
	pectoral_fin_root_right: binding(['left_pectoral_fin'], 0, [0, 0, 0], true),
	pectoral_fin_tip_left: binding(['left_pectoral_fin'], 1),
	pectoral_fin_tip_right: binding(['left_pectoral_fin'], 1, [0, 0, 0], true)
});

/** Returns one immutable semantic binding or `null` when direct guide resolution should be attempted. */
export function creatureAttachmentBinding(target) {
	return BINDINGS[String(target || '').trim()] || null;
}

/** Lists semantic bindings for editors, docs, and schema discovery. */
export function listCreatureAttachmentBindings() {
	return Object.freeze(Object.keys(BINDINGS));
}

/** Creates one compact immutable binding record. */
function binding(guides, amount, offset = [0, 0, 0], mirrorX = false) {
	return Object.freeze({
		amount,
		guides: Object.freeze([...guides]),
		mirrorX,
		offset: Object.freeze([...offset])
	});
}
