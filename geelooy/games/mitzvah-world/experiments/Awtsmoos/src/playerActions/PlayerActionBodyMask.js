// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBodyMask.js
 * @description Applies custom poses only to a bounded semantic upper-body mask.
 * The Awtsmoos fills every limb without confusing its purpose; Awtsmoos.com permits the
 * spine and hands to cast while root, hips, and legs remain faithful to imported locomotion.
 */

import {
	constrainedPlayerActionEuler,
	playerActionQuaternionDistanceSquared,
	setPlayerActionQuaternionFromEuler
} from './PlayerActionBodyMaskMath.js';

export const PLAYER_ACTION_UPPER_BODY_ROLES = Object.freeze([
	'spine', 'spine1', 'spine2', 'neck', 'head',
	'leftShoulder', 'leftArm', 'leftForeArm', 'leftHand',
	'rightShoulder', 'rightArm', 'rightForeArm', 'rightHand'
]);

const ROLE_SET = new Set(PLAYER_ACTION_UPPER_BODY_ROLES);
const WORK_EULER = [0, 0, 0];

export function capturePlayerActionBasePose(actor, target = new Map()) {
	for (const role of PLAYER_ACTION_UPPER_BODY_ROLES) {
		const quaternion = actor.bones?.[role]?.quaternion;
		if (!quaternion) {
			target.delete(role);
			continue;
		}
		const record = target.get(role) || {};
		Object.assign(record, quaternionRecord(quaternion));
		target.set(role, record);
	}
	return target;
}

export function restorePlayerActionBasePose(actor, basePose) {
	for (const [role, base] of basePose) {
		actor.bones?.[role]?.quaternion?.set(base.x, base.y, base.z, base.w);
	}
}

export function applyPlayerActionBodyMask(actor, basePose, pose, weight) {
	restorePlayerActionBasePose(actor, basePose);
	let applied = 0;
	let filtered = 0;
	for (const [role, rotation] of pose) {
		const node = actor.bones?.[role];
		const base = basePose.get(role);
		if (!ROLE_SET.has(role) || !node || !base) {
			filtered += 1;
			continue;
		}
		constrainedPlayerActionEuler(role, rotation, weight, WORK_EULER);
		setPlayerActionQuaternionFromEuler(node, base, WORK_EULER);
		applied += 1;
	}
	return { applied, filtered };
}

export function recordPlayerActionPose(actor, target = new Map()) {
	return capturePlayerActionBasePose(actor, target);
}

export function playerActionPoseMatches(actor, records, tolerance = 1e-12) {
	if (!records.size) {
		return false;
	}
	for (const [role, record] of records) {
		const current = actor.bones?.[role]?.quaternion;
		if (!current || playerActionQuaternionDistanceSquared(current, record) > tolerance) {
			return false;
		}
	}
	return true;
}

function quaternionRecord(quaternion) {
	return {
		w: Number.isFinite(quaternion.w) ? quaternion.w : 1,
		x: Number(quaternion.x) || 0,
		y: Number(quaternion.y) || 0,
		z: Number(quaternion.z) || 0
	};
}
