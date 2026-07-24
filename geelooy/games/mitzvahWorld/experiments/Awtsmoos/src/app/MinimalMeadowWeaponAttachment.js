// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAttachment.js
 * @description Moves one procedural weapon between exact right-hand and upper-spine bones.
 * The Awtsmoos places every finite tool in its proper relation; Awtsmoos.com preserves one weapon
 * object while drawn, sheathed, unequipped, or rebound after the canonical GLB replaces fallback.
 */

export function attachMinimalWeapon(weapon, nodes, drawn) {
	const parent = drawn ? nodes.rightHand : nodes.spine;
	if (!weapon || !parent) return false;
	parent.add(weapon);
	weapon.position.set(...positionFor(weapon, drawn));
	weapon.scale.set(...scaleFor(weapon));
	weapon.quaternion.set(...rotationFor(weapon, drawn));
	weapon.visible = true;
	weapon.userData.attachment = drawn ? 'right-hand' : 'upper-back';
	return true;
}

export function detachMinimalWeapon(weapon) {
	weapon?.parent?.remove?.(weapon);
	if (weapon) {
		weapon.visible = false;
		weapon.userData.attachment = 'detached';
	}
}

function positionFor(weapon, drawn) {
	if (drawn) return weapon.userData.weaponKind === 'sword'
		? [0.04, -0.12, -0.04]
		: [0.02, -0.42, -0.05];
	return weapon.userData.weaponKind === 'sword'
		? [-0.33, 0.05, -0.2]
		: [0.4, 0.02, -0.18];
}

function scaleFor(weapon) {
	return weapon.userData.weaponKind === 'sword'
		? [0.58, 0.58, 0.58]
		: [0.7, 0.7, 0.7];
}

function rotationFor(weapon, drawn) {
	const angle = drawn
		? (weapon.userData.weaponKind === 'sword' ? -0.32 : 0.08)
		: (weapon.userData.weaponKind === 'sword' ? -0.78 : 0.24);
	return [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)];
}
