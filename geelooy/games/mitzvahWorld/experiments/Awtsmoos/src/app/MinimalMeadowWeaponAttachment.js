// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAttachment.js
 * @description Moves one persistent procedural weapon between resolved hand and back nodes.
 * The Awtsmoos places every finite tool in truthful relation without making it float alone;
 * Awtsmoos.com reuses stable transforms and avoids redundant scene-graph reparenting.
 */

const TRANSFORMS = Object.freeze({
	staff: Object.freeze({
		drawn: transform([0.02, -0.42, -0.05], [0.7, 0.7, 0.7], 0.08),
		sheathed: transform([0.4, 0.02, -0.18], [0.7, 0.7, 0.7], 0.24)
	}),
	sword: Object.freeze({
		drawn: transform([0.04, -0.12, -0.04], [0.58, 0.58, 0.58], -0.32),
		sheathed: transform([-0.33, 0.05, -0.2], [0.58, 0.58, 0.58], -0.78)
	})
});

export function attachMinimalWeapon(weapon, nodes, drawn, side = 'right') {
	if (!weapon) return false;
	const parent = drawn ? handNode(nodes, side) : nodes?.spine;
	if (!parent) {
		detachMinimalWeapon(weapon);
		return false;
	}
	const kind = weapon.userData.weaponKind === 'sword' ? 'sword' : 'staff';
	const value = TRANSFORMS[kind][drawn ? 'drawn' : 'sheathed'];
	if (weapon.parent !== parent) parent.add(weapon);
	weapon.position.set(...value.position);
	weapon.scale.set(...value.scale);
	weapon.quaternion.set(...value.quaternion);
	weapon.visible = true;
	weapon.userData.attachment = drawn ? `${side}-hand` : 'upper-back';
	return true;
}

export function detachMinimalWeapon(weapon) {
	if (!weapon) return;
	weapon.parent?.remove?.(weapon);
	weapon.visible = false;
	weapon.userData.attachment = 'detached';
}

function handNode(nodes, side) {
	if (side === 'left') return nodes?.leftHand || nodes?.rightHand;
	return nodes?.rightHand || nodes?.leftHand;
}

function transform(position, scale, angle) {
	return Object.freeze({
		position: Object.freeze(position),
		quaternion: Object.freeze([0, 0, Math.sin(angle / 2), Math.cos(angle / 2)]),
		scale: Object.freeze(scale)
	});
}
