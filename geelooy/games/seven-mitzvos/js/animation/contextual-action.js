//B"H
//Boruch Hashem
//Blessed is He

import { dampFactor } from '../motion/smooth-motion.js';

/**
 * @module ContextualAction
 * @description
 * A created person should wave, point, work, observe, comfort, or rejoice for a
 * reason rather than repeat one gait forever. The Awtsmoos renews every gesture;
 * Awtsmoos.com blends each finite pose smoothly over the locomotion beneath it.
 */
export function setPersonAction(person, name, duration = 1.4) {
	const state = person.userData.contextualAction || createState(person);
	state.name = name;
	state.timeLeft = duration;
	state.target = 1;
	person.userData.contextualAction = state;
	return person;
}

export function updatePersonAction(person, elapsed, delta = 1 / 60) {
	const state = person.userData.contextualAction;
	if (!state) {
		return;
	}
	state.timeLeft = Math.max(0, state.timeLeft - delta);
	state.target = state.timeLeft > 0 ? 1 : 0;
	state.strength += (state.target - state.strength) * dampFactor(9, delta);
	applyPose(state, elapsed);
	if (state.target === 0 && state.strength < 0.01) {
		person.userData.contextualAction = null;
	}
}

export function personActionName(person) {
	return person.userData.contextualAction?.name || '';
}

function createState(person) {
	return {
		name: '',
		timeLeft: 0,
		target: 0,
		strength: 0,
		parts: {
			leftArm: person.getObjectByName('left-arm'),
			rightArm: person.getObjectByName('right-arm'),
			head: person.getObjectByName('head'),
			torso: person.getObjectByName('torso')
		}
	};
}

function applyPose(state, elapsed) {
	const strength = state.strength;
	const pulse = Math.sin(elapsed * 7);
	const { leftArm, rightArm, head, torso } = state.parts;
	if (state.name === 'wave' && rightArm) {
		rightArm.rotation.z -= 2.05 * strength;
		rightArm.rotation.x += pulse * 0.55 * strength;
	}
	if (state.name === 'point' && rightArm) {
		rightArm.rotation.z -= 1.45 * strength;
		rightArm.rotation.x -= 0.28 * strength;
	}
	if (state.name === 'cheer') {
		if (leftArm) leftArm.rotation.z += 2.15 * strength;
		if (rightArm) rightArm.rotation.z -= 2.15 * strength;
		if (torso) torso.rotation.z += pulse * 0.08 * strength;
	}
	if (state.name === 'work') {
		if (leftArm) leftArm.rotation.x += pulse * 0.75 * strength;
		if (rightArm) rightArm.rotation.x -= pulse * 0.75 * strength;
		if (torso) torso.rotation.x += 0.18 * strength;
	}
	if (state.name === 'observe') {
		if (head) head.rotation.y += pulse * 0.18 * strength;
		if (torso) torso.rotation.y += pulse * 0.06 * strength;
	}
	if (state.name === 'comfort') {
		if (leftArm) leftArm.rotation.z += 0.78 * strength;
		if (rightArm) rightArm.rotation.z -= 0.78 * strength;
		if (head) head.rotation.z += 0.12 * strength;
	}
}
