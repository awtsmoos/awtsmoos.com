// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLocomotionStride.js
 * @description Stride-phase locomotion presentation for the canonical Chossid.
 * Advances one stride phase strictly proportional to measured world distance (no
 * foot sliding), derives footstep events at each half-cycle for future audio,
 * and computes presentation-only vertical bob, lateral roll, and smoothed visual
 * facing. Physics state is never touched: callers apply the returned pose to the
 * visible model after authoritative placement.
 */

const TAU = Math.PI * 2;
const STRIDE_SMOOTH_RATE = 10;
const WEIGHT_EASE_RATE = 8;
const LABEL_DEBOUNCE_SECONDS = 0.18;
const MAX_FOOTSTEP_EVENTS = 32;
const WALK_BOB_AMPLITUDE = 0.028;
const RUN_BOB_AMPLITUDE = 0.045;
const WALK_ROLL_AMPLITUDE = 0.025;
const RUN_ROLL_AMPLITUDE = 0.04;

/** Creates one fresh stride presentation state. */
export function createLocomotionStride() {
	return {
		bobY: 0,
		cycleDistance: 0,
		footstepEvents: [],
		labelTimer: 0,
		phase: 0,
		roll: 0,
		smoothedLocomotion: 'stand',
		stepIndex: 0,
		strideWeight: 0,
		visualYaw: null
	};
}

/**
 * Advances stride presentation from measured locomotion.
 * @param {object} stride Mutable stride state from createLocomotionStride.
 * @param {object} input { deltaTime, moving, locomotion, speed, referenceSpeed,
 *   clipDuration, facing } — speed is measured world m/s, clipDuration the seconds
 *   per full walk/run clip cycle at rate 1, referenceSpeed the authored m/s the
 *   clip was timed against.
 * @returns {object} The same stride state.
 */
export function advanceLocomotionStride(stride, input = {}) {
	const dt = sanitizeDelta(input.deltaTime);
	const locomotion = input.locomotion || 'stand';
	const active = Boolean(input.moving)
		&& (locomotion === 'walk' || locomotion === 'run')
		&& dt > 0;
	debounceLocomotionLabel(stride, locomotion, dt);
	const referenceSpeed = Number(input.referenceSpeed) > 0 ? Number(input.referenceSpeed) : 1;
	const clipDuration = Number(input.clipDuration) > 0 ? Number(input.clipDuration) : 1;
	const cycleDistance = Math.max(1e-6, referenceSpeed * clipDuration);
	stride.cycleDistance = cycleDistance;
	if (active) {
		const distance = Math.max(0, Number(input.speed) || 0) * dt;
		advancePhase(stride, (distance / cycleDistance) * TAU, locomotion, Number(input.speed) || 0);
	}
	stride.strideWeight = approach(stride.strideWeight, active ? 1 : 0, dt, WEIGHT_EASE_RATE);
	const running = locomotion === 'run';
	const bobAmplitude = running ? RUN_BOB_AMPLITUDE : WALK_BOB_AMPLITUDE;
	const rollAmplitude = running ? RUN_ROLL_AMPLITUDE : WALK_ROLL_AMPLITUDE;
	stride.bobY = -(bobAmplitude / 2) * Math.cos(2 * stride.phase) * stride.strideWeight;
	stride.roll = rollAmplitude * Math.sin(stride.phase) * stride.strideWeight;
	if (stride.visualYaw === null || !Number.isFinite(stride.visualYaw)) {
		stride.visualYaw = Number(input.facing) || 0;
	} else {
		stride.visualYaw = approachAngle(stride.visualYaw, Number(input.facing) || 0, dt, STRIDE_SMOOTH_RATE);
	}
	return stride;
}

/** Returns and clears pending footstep events for future audio triggers. */
export function drainLocomotionFootsteps(stride) {
	if (!stride || stride.footstepEvents.length === 0) return [];
	const events = stride.footstepEvents.slice();
	stride.footstepEvents.length = 0;
	return events;
}

/**
 * Applies the stride pose to the visible model after authoritative placement.
 * Presentation-only: state.renderY / state.facing are read, never written.
 */
export function applyLocomotionStridePresentation(model, state, stride) {
	if (!model || !stride) return;
	model.position.y = state.renderY + (stride.bobY || 0);
	const yaw = Number.isFinite(stride.visualYaw) ? stride.visualYaw : state.facing;
	const sy = Math.sin(yaw / 2);
	const cy = Math.cos(yaw / 2);
	const sr = Math.sin((stride.roll || 0) / 2);
	const cr = Math.cos((stride.roll || 0) / 2);
	model.quaternion.set(sy * sr, sy * cr, cy * sr, cy * cr);
}

function advancePhase(stride, delta, locomotion, speed) {
	if (!(delta > 0)) return;
	const before = stride.phase;
	const after = before + delta;
	const crossed = Math.floor(after / Math.PI) - Math.floor(before / Math.PI);
	for (let i = 0; i < crossed; i++) {
		stride.stepIndex += 1;
		stride.footstepEvents.push(Object.freeze({
			locomotion,
			phase: stride.stepIndex * Math.PI,
			speed,
			stepIndex: stride.stepIndex
		}));
		if (stride.footstepEvents.length > MAX_FOOTSTEP_EVENTS) stride.footstepEvents.shift();
	}
	stride.phase = after % TAU;
}

function debounceLocomotionLabel(stride, locomotion, dt) {
	if (locomotion === stride.smoothedLocomotion) {
		stride.labelTimer = 0;
		return;
	}
	// Stopping is instant (feet must plant the moment travel ends); only
	// walk/run/air transitions debounce so the label cannot flutter.
	if (locomotion === 'stand' || locomotion === 'reset') {
		stride.smoothedLocomotion = locomotion;
		stride.labelTimer = 0;
		return;
	}
	stride.labelTimer += dt;
	if (stride.labelTimer >= LABEL_DEBOUNCE_SECONDS) {
		stride.smoothedLocomotion = locomotion;
		stride.labelTimer = 0;
	}
}

function sanitizeDelta(value) {
	const dt = Number(value);
	if (!Number.isFinite(dt) || dt <= 0) return 0;
	return Math.min(dt, 0.2);
}

function approach(current, target, deltaTime, responsiveness) {
	return current + (target - current) * Math.min(1, deltaTime * responsiveness);
}

function approachAngle(current, target, deltaTime, rate) {
	let delta = (target - current) % TAU;
	if (delta > Math.PI) delta -= TAU;
	if (delta < -Math.PI) delta += TAU;
	const maxStep = rate * deltaTime;
	if (Math.abs(delta) <= maxStep) return target;
	return current + Math.sign(delta) * maxStep;
}
