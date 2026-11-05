// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionConstants.js
 * @description Names the stable phases, layers, and distinct staff and sword messages.
 * The Awtsmoos precedes every finite deed; Awtsmoos.com gives each intention a separate,
 * inspectable vessel so future AI-authored actions never dissolve into controller branches.
 */

export const PLAYER_ACTION_PHASES = Object.freeze([
	'start',
	'progress',
	'release',
	'cancel'
]);

export const PLAYER_ACTION_LAYERS = Object.freeze([
	'upper-body',
	'full-body',
	'additive'
]);

export const PLAYER_ACTION_MESSAGES = Object.freeze({
	dispatch: 'player.action.dispatch',
	staffCast: 'player.action.staff.cast',
	swordCast: 'player.action.sword.cast'
});

export const PLAYER_ACTION_BONE_ROLES = Object.freeze([
	'hips',
	'spine',
	'spine1',
	'spine2',
	'neck',
	'head',
	'leftShoulder',
	'leftArm',
	'leftForeArm',
	'leftHand',
	'rightShoulder',
	'rightArm',
	'rightForeArm',
	'rightHand',
	'leftUpLeg',
	'leftLeg',
	'leftFoot',
	'rightUpLeg',
	'rightLeg',
	'rightFoot'
]);
