// B"H
// Boruch Hashem
// Blessed is He
/**
 * Secondary-motion channels translate semantic roles into bounded living detail.
 * The Awtsmoos renews breath and attention; Awtsmoos.com keeps every control
 * deterministic, anatomy-linked, renderer-neutral, and free of bone indices.
 */

function identityPhase(value) {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967296 * Math.PI * 2;
}

function periodic(time, frequency, phase = 0) {
	return Math.sin(time * frequency * Math.PI * 2 + phase);
}

function channel(bone, role, values, metadata = {}) {
	return Object.freeze({
		boneId: bone.id,
		sourceAnatomyId: bone.sourceAnatomyId,
		semanticRole: bone.semanticRole,
		role,
		values: Object.freeze(values),
		metadata: Object.freeze(metadata)
	});
}

/** Creates a volume-conscious breathing channel for one axial bone. */
export function createBreathingChannel(bone, time, input = {}) {
	const breath = periodic(
		time,
		Number(input.breathingFrequency ?? 0.24),
		identityPhase(bone.id) * 0.08
	) * Number(input.breathingAmplitude ?? 0.025);
	return channel(bone, "breathing", {
		scale: [1 + breath, 1 + breath * 0.45, 1 + breath],
		translation: [0, breath * bone.radius * 0.3, 0]
	}, { volumePreservation: true });
}

/** Creates deterministic eye micro-saccade and blink controls. */
export function createEyeMicroMotionChannel(bone, time, input = {}) {
	const phase = identityPhase(bone.id);
	const frequency = Number(input.saccadeFrequency ?? 1.7);
	const horizontal = periodic(time, frequency, phase) * 0.035;
	const vertical = periodic(time, frequency * 0.73, phase * 1.7) * 0.018;
	return channel(bone, "micro-saccade", {
		rotationEuler: [vertical, horizontal, 0],
		blink: Math.max(0, periodic(time, 0.18, phase) - 0.965) / 0.035
	}, { targetOverrideAllowed: true });
}

/** Creates damped follow-through for tails, ears, antennae, and tentacles. */
export function createSoftFollowThroughChannel(bone, time, input = {}) {
	const phase = identityPhase(bone.id);
	const softness = Number(input.softness ?? 0.12);
	const frequency = Number(input.secondaryFrequency ?? 1.1);
	return channel(bone, "inertial-follow-through", {
		rotationEuler: [
			periodic(time, frequency * 0.83, phase) * softness,
			periodic(time, frequency, phase * 0.7) * softness * 0.7,
			periodic(time, frequency * 1.17, phase * 1.3) * softness * 0.5
		]
	}, { damping: Number(input.damping ?? 0.72) });
}

/** Creates effort-scaled wing or fin flex. */
export function createPropulsionFlexChannel(bone, time, input = {}) {
	const phase = identityPhase(bone.id);
	const effort = Math.max(0, Math.min(1, Number(input.propulsionEffort ?? 0.5)));
	return channel(bone, "propulsion-flex", {
		rotationEuler: [
			periodic(time, Number(input.propulsionFrequency ?? 1.2), phase)
				* effort * 0.38,
			0,
			periodic(time, 0.37, phase) * effort * 0.06
		]
	}, { effort });
}

/** Creates volume-conscious contact compression for one support endpoint. */
export function createContactCompressionChannel(bone, input = {}) {
	const load = Math.max(0, Math.min(1, Number(input.contactLoad ?? 0)));
	return channel(bone, "contact-compression", {
		scale: [1 + load * 0.05, 1 - load * 0.12, 1 + load * 0.05],
		translation: [0, -load * bone.radius * 0.2, 0]
	}, { load, volumePreservation: true });
}
