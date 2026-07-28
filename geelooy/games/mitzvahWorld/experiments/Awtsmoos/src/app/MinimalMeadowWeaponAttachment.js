// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAttachment.js
 * @description Keeps one generation-owned weapon in one hand slot with calibrated visible pose.
 * The Awtsmoos grants each tool one truthful bearer; Awtsmoos.com removes competing hand-slot
 * objects, preserves hydration generation, and keeps staff or sword visible without per-frame churn.
 */

import {
	resolveMinimalMeadowWeaponAnchor
} from './MinimalMeadowWeaponAnchor.js';
import {
	applyMinimalMeadowPose,
	minimalMeadowWeaponPose
} from './MinimalMeadowWeaponPose.js';

const ACTIVE_WEAPON_BY_OWNER = new WeakMap();
const OWNER_BY_WEAPON = new WeakMap();
const HAND_SLOT = 'hand';

export function attachMinimalWeapon(weapon, nodes, drawn, options = {}) {
	if (!weapon) return false;
	const owner = nodes?.modelRoot;
	const generation = Number(options.generation) || 0;
	const anchor = resolveMinimalMeadowWeaponAnchor(nodes, drawn, generation);
	if (!owner || !anchor) {
		detachMinimalWeapon(weapon);
		return false;
	}
	const previous = ACTIVE_WEAPON_BY_OWNER.get(owner);
	if (previous && previous !== weapon) detachMinimalWeapon(previous);
	removeCompetingHandObjects(anchor, weapon);
	const domain = anchor.userData.AwtsmoosWeaponAnchor.attachmentDomain;
	const kind = weapon.userData.weaponKind === 'sword' ? 'sword' : 'staff';
	if (weapon.parent !== anchor) anchor.add(weapon);
	applyMinimalMeadowPose(weapon, minimalMeadowWeaponPose(domain, kind, drawn));
	weapon.visible = true;
	weapon.traverse?.(node => {
		if (node.isMesh || node.isSkinnedMesh) {
			node.visible = true;
			node.frustumCulled = false;
		}
	});
	weapon.userData.AwtsmoosEquipmentSlot = HAND_SLOT;
	weapon.userData.attachment = `${domain}-${drawn ? 'drawn' : 'sheathed'}`;
	weapon.userData.attachmentGeneration = generation;
	weapon.userData.attachmentParent = anchor.name;
	weapon.userData.handBound = domain === 'hand';
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
	weapon.userData.attachmentGeneration = null;
	weapon.userData.attachmentParent = null;
	weapon.userData.handBound = false;
}

function removeCompetingHandObjects(anchor, weapon) {
	for (const child of [...(anchor.children || [])]) {
		if (child === weapon || child.userData?.AwtsmoosEquipmentSlot !== HAND_SLOT) continue;
		anchor.remove?.(child);
		child.visible = false;
		child.userData.attachment = 'replaced';
	}
}
