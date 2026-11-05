// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SwordCastAction.js
 * @description Defines a charged sword guard, arc, and follow-through absent from the GLB.
 * The Awtsmoos creates restraint and release together; Awtsmoos.com gives the Spark Blade
 * its own message, equipment law, timing, and semantic-bone language apart from the staff.
 */

import { PLAYER_ACTION_MESSAGES } from '../../PlayerActionConstants.js';

export const SWORD_CAST_ACTION = Object.freeze({
	autoRelease: false,
	duration: 1.05,
	id: 'sword.cast',
	keyframes: Object.freeze([
		frame(0, {
			rightArm: [-0.1, -0.12, 0.22],
			rightForeArm: [-0.4, 0.04, -0.14],
			rightHand: [-0.08, 0.12, 0.04],
			spine2: [0.03, -0.06, 0]
		}),
		frame(0.2, {
			head: [0, 0.08, 0],
			leftArm: [-0.18, 0.1, -0.12],
			rightArm: [0.16, -0.42, 0.56],
			rightForeArm: [-0.78, 0.08, -0.22],
			rightHand: [-0.12, 0.2, 0.1],
			spine2: [0.1, -0.28, 0]
		}),
		frame(0.52, {
			head: [0.02, 0.12, 0],
			leftArm: [-0.28, 0.14, -0.18],
			rightArm: [-0.18, -0.58, 0.62],
			rightForeArm: [-0.92, 0.12, -0.2],
			rightHand: [-0.16, 0.26, 0.12],
			spine1: [0.05, -0.12, 0],
			spine2: [0.12, -0.38, 0]
		}),
		frame(0.74, {
			head: [0, -0.08, 0],
			leftArm: [-0.12, -0.08, -0.06],
			rightArm: [-1.08, 0.16, 0.06],
			rightForeArm: [-0.14, -0.04, -0.02],
			rightHand: [-0.05, -0.22, -0.06],
			spine1: [-0.08, 0.12, 0],
			spine2: [-0.22, 0.24, 0]
		}),
		frame(0.9, {
			rightArm: [-0.62, 0.06, 0.14],
			rightForeArm: [-0.34, 0, -0.08],
			spine2: [-0.1, 0.12, 0]
		}),
		frame(1, {})
	]),
	layer: 'upper-body',
	messageType: PLAYER_ACTION_MESSAGES.swordCast,
	priority: 55,
	recovery: 0.28,
	releaseAt: 0.74,
	releaseEvent: 'player.action.sword.release',
	requiredEquipment: Object.freeze({
		itemIds: Object.freeze(['spark-blade']),
		slot: 'hand'
	}),
	version: 1
});

function frame(at, pose) {
	return Object.freeze({ at, pose: Object.freeze(pose) });
}
