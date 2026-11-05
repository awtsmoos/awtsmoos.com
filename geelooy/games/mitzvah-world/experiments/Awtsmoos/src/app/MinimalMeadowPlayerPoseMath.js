// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerPoseMath.js
 * @description Resolves bone roles, phase weights, and allocation-free additive quaternion turns.
 * The Awtsmoos joins imported pose and deliberate gesture in one normalized vessel; Awtsmoos.com
 * keeps trigonometry, easing, and naming outside the cached binder's smaller responsibility.
 */

import { MINIMAL_MEADOW_BONE_ROLES as ROLES } from './MinimalMeadowPlayerPoseLibrary.js';

export function minimalMeadowBoneRole(name) {
	const normalized = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
	return Object.keys(ROLES).find(role => ROLES[role] === normalized) || '';
}

export function minimalMeadowPoseAmount(controller) {
	const ratio = controller.duration && Number.isFinite(controller.duration)
		? Math.min(1, controller.elapsed / controller.duration)
		: controller.progress;
	if (controller.state === 'cast-windup') {
		return smooth(Math.min(1, controller.progress / 0.3));
	}
	if (controller.state === 'cast-channel') {
		return 0.95 + Math.sin(controller.elapsed * 8) * 0.05;
	}
	if (controller.state === 'cast-release') return 1 - ratio * 0.3;
	if (controller.state === 'hit-reaction') return Math.sin(Math.PI * ratio);
	if (controller.state.endsWith('recovery')) return 1 - smooth(ratio);
	return smooth(ratio || 1);
}

export function applyMinimalMeadowEuler(node, x, y, z) {
	if (!node) return;
	const halfX = x * 0.5;
	const halfY = y * 0.5;
	const halfZ = z * 0.5;
	const sinX = Math.sin(halfX);
	const cosX = Math.cos(halfX);
	const sinY = Math.sin(halfY);
	const cosY = Math.cos(halfY);
	const sinZ = Math.sin(halfZ);
	const cosZ = Math.cos(halfZ);
	const offsetX = sinX * cosY * cosZ + cosX * sinY * sinZ;
	const offsetY = cosX * sinY * cosZ - sinX * cosY * sinZ;
	const offsetZ = cosX * cosY * sinZ + sinX * sinY * cosZ;
	const offsetW = cosX * cosY * cosZ - sinX * sinY * sinZ;
	const quaternion = node.quaternion;
	const sourceX = quaternion.x;
	const sourceY = quaternion.y;
	const sourceZ = quaternion.z;
	const sourceW = quaternion.w;
	quaternion.set(
		sourceW * offsetX + sourceX * offsetW + sourceY * offsetZ - sourceZ * offsetY,
		sourceW * offsetY - sourceX * offsetZ + sourceY * offsetW + sourceZ * offsetX,
		sourceW * offsetZ + sourceX * offsetY - sourceY * offsetX + sourceZ * offsetW,
		sourceW * offsetW - sourceX * offsetX - sourceY * offsetY - sourceZ * offsetZ
	);
}

function smooth(value) {
	return value * value * (3 - 2 * value);
}
