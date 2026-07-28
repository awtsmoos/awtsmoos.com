// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAim.js
 * @description Aims the hand-bound weapon toward the selected target during charged casting.
 * The Awtsmoos carries intention from hand toward its finite address; Awtsmoos.com resolves
 * both full scene nodes and lightweight groups without corrupting body-facing authority.
 */

import { Vector3 } from '../../../light-three-gltf/tiny-runtime.js';
import { applyAnchorTransform } from './MinimalMeadowWeaponAnchor.js';

const HAND = new Vector3();
const TARGET = new Vector3();

export function aimMinimalMeadowWeapon(owner, payload = null) {
	const anchor = owner.weapon?.parent;
	const target = owner.runtime?.enemies?.selected;
	if (!anchor || !target?.group) return false;
	worldPosition(anchor.parent || anchor, HAND);
	worldPosition(target.group, TARGET);
	const targetHeight = positive(target.profile?.height, 2.4);
	const dx = TARGET.x - HAND.x;
	const dy = TARGET.y + targetHeight * 0.58 - HAND.y;
	const dz = TARGET.z - HAND.z;
	const horizontal = Math.max(0.001, Math.hypot(dx, dz));
	const worldYaw = Math.atan2(dx, dz);
	const localYaw = normalizeAngle(
		worldYaw - Number(owner.runtime.state?.facing || 0)
	);
	const elevation = Math.atan2(dy, horizontal);
	const pitch = Math.PI / 2 - elevation;
	setYawPitch(anchor.quaternion, localYaw, pitch);
	anchor.userData.AwtsmoosWeaponAim = {
		actionId: payload?.actionId || null,
		elevation,
		localYaw,
		pitch,
		targetId: target.profile?.id || null
	};
	return true;
}

export function restoreMinimalMeadowWeaponAim(owner) {
	const anchor = owner.weapon?.parent;
	if (!anchor) return;
	applyAnchorTransform(anchor, owner.drawn);
	delete anchor.userData.AwtsmoosWeaponAim;
}

function worldPosition(object, target) {
	if (typeof object?.getWorldPosition === 'function') {
		return object.getWorldPosition(target);
	}
	target.set(0, 0, 0);
	for (let current = object; current; current = current.parent) {
		target.x += Number(current.position?.x) || 0;
		target.y += Number(current.position?.y) || 0;
		target.z += Number(current.position?.z) || 0;
	}
	return target;
}

function setYawPitch(quaternion, yaw, pitch) {
	const halfYaw = yaw / 2;
	const halfPitch = pitch / 2;
	const sy = Math.sin(halfYaw);
	const cy = Math.cos(halfYaw);
	const sx = Math.sin(halfPitch);
	const cx = Math.cos(halfPitch);
	quaternion.set(cy * sx, sy * cx, -sy * sx, cy * cx);
}

function normalizeAngle(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
