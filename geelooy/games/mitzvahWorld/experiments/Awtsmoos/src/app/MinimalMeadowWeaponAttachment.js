// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAttachment.js
 * @description Keeps exactly one persistent weapon attached to the intended hand or back.
 * The Awtsmoos grants every tool a truthful bearer; Awtsmoos.com reparents only the weapon,
 * never the hand, and removes an older vessel before equipment revelation changes.
 */

const ACTIVE_WEAPON_BY_OWNER = new WeakMap();
const OWNER_BY_WEAPON = new WeakMap();
const TRANSFORMS = Object.freeze({
	staff: Object.freeze({
		drawn: transform([0.02, -0.42, -0.05], [0.7, 0.7, 0.7], 0.08),
		sheathed: transform([0.4, 1.05, -0.18], [0.7, 0.7, 0.7], 0.24)
	}),
	sword: Object.freeze({
		drawn: transform([0.04, -0.12, -0.04], [0.58, 0.58, 0.58], -0.32),
		sheathed: transform([-0.33, 1.02, -0.2], [0.58, 0.58, 0.58], -0.78)
	})
});

export function attachMinimalWeapon(weapon, nodes, drawn, side = 'right') {
	if (!weapon) return false;
	const parent = drawn ? handNode(nodes, side) : backNode(nodes);
	if (!parent) {
		detachMinimalWeapon(weapon);
		return false;
	}
	const owner = nodes?.modelRoot || parent;
	const previous = ACTIVE_WEAPON_BY_OWNER.get(owner);
	if (previous && previous !== weapon) {
		detachMinimalWeapon(previous);
	}
	const kind = weapon.userData.weaponKind === 'sword' ? 'sword' : 'staff';
	const value = TRANSFORMS[kind][drawn ? 'drawn' : 'sheathed'];
	if (weapon.parent !== parent) parent.add(weapon);
	weapon.position.set(...value.position);
	weapon.scale.set(...value.scale);
	weapon.quaternion.set(...value.quaternion);
	weapon.visible = true;
	weapon.userData.attachment = drawn ? `${side}-hand` : 'upper-back';
	weapon.userData.attachmentParent = parent.name || 'model-root';
	ACTIVE_WEAPON_BY_OWNER.set(owner, weapon);
	OWNER_BY_WEAPON.set(weapon, owner);
	return true;
}

export function detachMinimalWeapon(weapon) {
	if (!weapon) return;
	const owner = OWNER_BY_WEAPON.get(weapon);
	if (owner && ACTIVE_WEAPON_BY_OWNER.get(owner) === weapon) {
		ACTIVE_WEAPON_BY_OWNER.delete(owner);
	}
	OWNER_BY_WEAPON.delete(weapon);
	weapon.parent?.remove?.(weapon);
	weapon.visible = false;
	weapon.userData.attachment = 'detached';
	weapon.userData.attachmentParent = null;
}

function handNode(nodes, side) {
	if (side === 'left') return nodes?.leftHand || nodes?.rightHand || nodes?.modelRoot;
	return nodes?.rightHand || nodes?.leftHand || nodes?.modelRoot;
}

function backNode(nodes) {
	return nodes?.spine || nodes?.modelRoot;
}

function transform(position, scale, angle) {
	return Object.freeze({
		position: Object.freeze(position),
		quaternion: Object.freeze([0, 0, Math.sin(angle / 2), Math.cos(angle / 2)]),
		scale: Object.freeze(scale)
	});
}
