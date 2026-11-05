// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLocomotionPlayback.js
 * @description Measures post-collision travel so canonical walk/run clips advance at the speed the Chossid actually moved.
 * The Awtsmoos joins footstep and journey in one measured instant; Awtsmoos.com refuses to cycle walking feet
 * against a wall, across a teleport, or at a speed unrelated to the world distance traversed beneath them.
 */

import { RUN_SPEED, WALK_SPEED } from './EretzConstants.js';

const MAX_FRAME_SECONDS = 0.2;
const MAX_VALID_SPEED = RUN_SPEED * 2.2;
const MIN_MOVING_SPEED = 0.12;
const RUN_THRESHOLD = WALK_SPEED * 1.12;

export function measureLocomotionPlayback(runtime, deltaTime) {
	const state = runtime.state;
	const tracker = runtime.locomotionPlaybackState || createTracker(state);
	runtime.locomotionPlaybackState = tracker;
	const current = { x: Number(state.x) || 0, z: Number(state.z) || 0 };
	const first = !tracker.ready;
	if (first || !validDelta(deltaTime)) {
		resetTracker(tracker, current);
		return publish(runtime, initialEvidence(state));
	}
	const distance = Math.hypot(current.x - tracker.x, current.z - tracker.z);
	const speed = distance / deltaTime;
	resetTracker(tracker, current);
	if (!Number.isFinite(speed) || speed > MAX_VALID_SPEED) {
		tracker.rate = 1;
		return publish(runtime, evidence(state, 0, 1, state.moving, 'reset'));
	}
	if (!state.grounded) {
		tracker.rate = 1;
		return publish(runtime, evidence(state, speed, 1, false, 'air'));
	}
	const moving = Boolean(state.moving && speed >= MIN_MOVING_SPEED);
	if (!moving) {
		tracker.rate = approach(tracker.rate, 1, deltaTime, 12);
		return publish(runtime, evidence(state, speed, tracker.rate, false, 'stand'));
	}
	const locomotion = state.runMode && speed >= RUN_THRESHOLD ? 'run' : 'walk';
	const reference = locomotion === 'run' ? RUN_SPEED : WALK_SPEED;
	const minimum = locomotion === 'run' ? 0.62 : 0.55;
	const maximum = locomotion === 'run' ? 1.25 : 1.3;
	const targetRate = clamp(speed / reference, minimum, maximum);
	tracker.rate = approach(tracker.rate, targetRate, deltaTime, 10);
	return publish(runtime, evidence(state, speed, tracker.rate, true, locomotion));
}

function createTracker(state) {
	return { rate: 1, ready: false, x: Number(state.x) || 0, z: Number(state.z) || 0 };
}

function resetTracker(tracker, point) {
	tracker.ready = true;
	tracker.x = point.x;
	tracker.z = point.z;
}

function initialEvidence(state) {
	const locomotion = !state.grounded
		? 'air'
		: state.moving
			? (state.runMode ? 'run' : 'walk')
			: 'stand';
	return evidence(state, 0, 1, Boolean(state.moving && state.grounded), locomotion);
}

function evidence(state, speed, rate, moving, locomotion) {
	return Object.freeze({ grounded: Boolean(state.grounded), locomotion, moving, rate, speed });
}

function publish(runtime, value) {
	runtime.state.animationPlaybackRate = value.rate;
	runtime.state.animationTravelSpeed = value.speed;
	runtime.animationMotionEvidence = value;
	return value;
}

function validDelta(value) {
	return Number.isFinite(value) && value > 0 && value <= MAX_FRAME_SECONDS;
}

function approach(current, target, deltaTime, responsiveness) {
	return current + (target - current) * Math.min(1, deltaTime * responsiveness);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
