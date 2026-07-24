// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerPoseLibrary.js
 * @description Declares finite Mixamo roles and deliberate cast, melee, and hit gestures.
 * The Awtsmoos gives every shoulder and hand a measured turn; Awtsmoos.com keeps static pose data
 * immutable, shared, inspectable, and separate from the runtime binder that applies it each frame.
 */

export const MINIMAL_MEADOW_BONE_ROLES = Object.freeze({
	head: 'mixamorighead',
	leftArm: 'mixamorigleftarm',
	leftForeArm: 'mixamorigleftforearm',
	leftHand: 'mixamoriglefthand',
	leftShoulder: 'mixamorigleftshoulder',
	neck: 'mixamorigneck',
	rightArm: 'mixamorigrightarm',
	rightForeArm: 'mixamorigrightforearm',
	rightHand: 'mixamorigrighthand',
	rightShoulder: 'mixamorigrightshoulder',
	spine: 'mixamorigspine',
	spine1: 'mixamorigspine1',
	spine2: 'mixamorigspine2'
});

export const MINIMAL_MEADOW_PLAYER_POSES = Object.freeze({
	'cast-windup': Object.freeze([
		['spine2', -0.08, 0.12, 0], ['leftShoulder', -0.26, 0, -0.34],
		['leftArm', -0.42, 0.05, -0.2], ['leftForeArm', -0.68, 0.08, 0.2],
		['leftHand', -0.12, 0.22, 0.08], ['rightShoulder', -0.2, 0, 0.34],
		['rightArm', -0.52, -0.04, 0.24], ['rightForeArm', -0.72, -0.08, -0.16],
		['rightHand', -0.16, -0.24, -0.08], ['neck', 0.04, 0.08, 0],
		['head', 0.02, 0.1, 0]
	]),
	'cast-channel': Object.freeze([
		['spine1', -0.06, 0, 0], ['spine2', -0.14, 0.08, 0],
		['leftShoulder', -0.32, 0, -0.42], ['leftArm', -0.62, 0.08, -0.28],
		['leftForeArm', -0.88, 0.12, 0.28], ['leftHand', -0.2, 0.3, 0.12],
		['rightShoulder', -0.3, 0, 0.42], ['rightArm', -0.66, -0.08, 0.3],
		['rightForeArm', -0.9, -0.12, -0.24], ['rightHand', -0.22, -0.32, -0.1],
		['neck', 0.06, 0.1, 0], ['head', 0.04, 0.14, 0]
	]),
	'cast-release': Object.freeze([
		['spine2', -0.18, -0.08, 0], ['leftArm', -0.46, 0.18, -0.2],
		['leftForeArm', -0.74, 0.12, 0.16], ['rightShoulder', -0.24, 0, 0.28],
		['rightArm', -0.92, -0.12, 0.12], ['rightForeArm', -0.34, -0.08, -0.06],
		['rightHand', -0.08, -0.28, 0], ['neck', 0.02, -0.08, 0],
		['head', 0.02, -0.12, 0]
	]),
	'melee-windup': Object.freeze([
		['spine2', 0.08, -0.24, 0], ['rightShoulder', -0.12, 0, 0.22],
		['rightArm', 0.12, -0.32, 0.48], ['rightForeArm', -0.72, 0.06, -0.2],
		['rightHand', -0.1, 0.14, 0.08], ['head', 0, 0.12, 0]
	]),
	'melee-impact': Object.freeze([
		['spine2', -0.18, 0.18, 0], ['rightShoulder', -0.28, 0, 0.12],
		['rightArm', -0.98, 0.08, 0.08], ['rightForeArm', -0.18, 0, -0.04],
		['rightHand', -0.08, -0.18, 0], ['head', 0, -0.08, 0]
	]),
	'melee-recovery': Object.freeze([
		['spine2', -0.08, 0.08, 0], ['rightArm', -0.42, 0, 0.16],
		['rightForeArm', -0.44, 0, -0.08]
	]),
	'hit-reaction': Object.freeze([
		['spine1', 0.18, 0, 0.12], ['spine2', 0.26, -0.12, 0],
		['head', 0.14, 0.1, 0.08]
	])
});
