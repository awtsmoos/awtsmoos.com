// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StaffCastAction.js
 * @description Defines a two-handed staff focus and release absent from the canonical GLB.
 * The Awtsmoos creates support and direction as one deed; Awtsmoos.com keeps the staff
 * message, equipment law, timing, and semantic-bone arc wholly separate from sword work.
 */

import { PLAYER_ACTION_MESSAGES } from '../../PlayerActionConstants.js';

export const STAFF_CAST_ACTION = Object.freeze({
	autoRelease: false,
	duration: 1.35,
	id: 'staff.cast',
	keyframes: Object.freeze([
		frame(0, {
			leftArm: [-0.18, 0.02, -0.12],
			leftForeArm: [-0.26, 0.02, 0.12],
			rightArm: [-0.24, -0.04, 0.14],
			rightForeArm: [-0.34, -0.04, -0.12],
			spine2: [-0.03, 0.02, 0]
		}),
		frame(0.24, {
			leftArm: [-0.48, 0.08, -0.28],
			leftForeArm: [-0.72, 0.12, 0.22],
			leftHand: [-0.12, 0.2, 0.08],
			rightArm: [-0.56, -0.08, 0.26],
			rightForeArm: [-0.78, -0.1, -0.18],
			rightHand: [-0.14, -0.22, -0.08],
			spine2: [-0.09, 0.08, 0]
		}),
		frame(0.58, {
			head: [0.03, 0.1, 0],
			leftArm: [-0.68, 0.1, -0.34],
			leftForeArm: [-0.92, 0.14, 0.3],
			leftHand: [-0.2, 0.32, 0.12],
			neck: [0.05, 0.08, 0],
			rightArm: [-0.74, -0.12, 0.34],
			rightForeArm: [-0.96, -0.14, -0.26],
			rightHand: [-0.22, -0.34, -0.1],
			spine1: [-0.05, 0, 0],
			spine2: [-0.15, 0.09, 0]
		}),
		frame(0.82, {
			head: [0.02, -0.08, 0],
			leftArm: [-0.42, 0.16, -0.18],
			leftForeArm: [-0.66, 0.1, 0.12],
			rightArm: [-0.98, -0.1, 0.1],
			rightForeArm: [-0.3, -0.06, -0.04],
			rightHand: [-0.06, -0.26, 0],
			spine2: [-0.19, -0.08, 0]
		}),
		frame(1, {})
	]),
	layer: 'upper-body',
	messageType: PLAYER_ACTION_MESSAGES.staffCast,
	priority: 50,
	recovery: 0.24,
	releaseAt: 0.82,
	releaseEvent: 'player.action.staff.release',
	requiredEquipment: Object.freeze({
		itemIds: Object.freeze(['wooden-staff']),
		slot: 'hand'
	}),
	version: 1
});

function frame(at, pose) {
	return Object.freeze({ at, pose: Object.freeze(pose) });
}
