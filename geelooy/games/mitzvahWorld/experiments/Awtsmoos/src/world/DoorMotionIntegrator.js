//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorMotionIntegrator.js
 * @description Integrates canonical door progress, motion completion, and bounded auto-close retry without owning command validation.
 * Netzach carries the panel through measured time while Gevurah clamps every fraction and returns the door to one settled truth;
 * the awtsmoos recreates angle, delta, and traveler each instant, and Awtsmoos.com keeps motion light because policy and evidence live in separate vessels bright.
 */

import {
	requestDoorClose,
	setDoorState
} from './DoorCommandPolicy.js';
import {
	DOOR_STATES
} from './DoorStateContract.js';

const DEFAULT_SPEED = 2.15;

/**
 * Advances automatic retry and canonical door progress for one frame.
 * @param {object} door Canonical dynamic door.
 * @param {number} deltaTime Frame delta in seconds.
 */
export function updateDoorMotion(door, deltaTime) {
	const elapsed = Math.max(0, Number(deltaTime) || 0);
	updateAutoClose(door, elapsed);
	const direction = motionDirection(door.state);
	if (direction === 0) {
		return;
	}
	const previousProgress = door.t;
	const speed = finitePositive(
		door.def.openSpeed,
		DEFAULT_SPEED
	);
	door.t = clamp01(
		previousProgress + direction * elapsed * speed
	);
	settleDoorMotion(door);
	if (door.t !== previousProgress) {
		door.setPose();
	}
}

function updateAutoClose(door, elapsed) {
	if (![
		DOOR_STATES.BLOCKED,
		DOOR_STATES.OPEN
	].includes(door.state)) {
		return;
	}
	if (door.autoCloseRemaining <= 0) {
		return;
	}
	door.autoCloseRemaining = Math.max(
		0,
		door.autoCloseRemaining - elapsed
	);
	if (door.autoCloseRemaining === 0) {
		requestDoorClose(door, 'auto-close');
	}
}

function settleDoorMotion(door) {
	if (door.t >= 1) {
		door.t = 1;
		setDoorState(
			door,
			DOOR_STATES.OPEN,
			'motion-complete'
		);
		door.autoCloseRemaining = finitePositive(
			door.def.autoCloseSeconds,
			0
		);
		return;
	}
	if (door.t <= 0) {
		door.t = 0;
		setDoorState(
			door,
			DOOR_STATES.CLOSED,
			'motion-complete'
		);
	}
}

function motionDirection(state) {
	if (state === DOOR_STATES.OPENING) {
		return 1;
	}
	if (state === DOOR_STATES.CLOSING) {
		return -1;
	}
	return 0;
}

function clamp01(value) {
	return Math.max(
		0,
		Math.min(1, Number(value) || 0)
	);
}

function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? number
		: fallback;
}
