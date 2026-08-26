// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbAnimationChannels.js
 * @description Gives every arbitrary semantic limb its own animation channel over the real Yetzirah segment bones.
 * RESPONSIBILITY: expose stable bone groups, gait phase offsets, and independent speed/amplitude/time overrides per limb.
 * NON-RESPONSIBILITY: this vessel does not invent joint rotations, replace IK, alter the skeleton, or assume a fixed leg count.
 * The Awtsmoos lets many legs share one song while each enters on its own measured beat;
 * Awtsmoos.com keeps every limb free to move alone, yet all may answer one body rhythm without confusion at their feet.
 */

/**
 * Creates one immutable animation-channel descriptor for every creature limb.
 * @param {object} creature Briah creature with arbitrary semantic limbs.
 * @param {object} rig Yetzirah rig containing bones and contact targets.
 * @param {object} input Optional `limbOverrides` keyed by limb id.
 * @returns {Array<object>} Stable renderer-neutral limb animation channels.
 */
export function createLimbAnimationChannels(creature, rig, input = {}) {
	const contactTargets = rig.contactTargets || [];
	return creature.limbs.map((limb, limbIndex) => {
		const override = input.limbOverrides?.[limb.id] || {};
		const phaseOffset = normalizedPhase(
			defaultPhase(limb, limbIndex, creature.limbs, contactTargets)
			+ finite(override.phaseOffset, 0)
		);
		return Object.freeze({
			amplitudeScale: positive(override.amplitudeScale, 1),
			animationGroupId: `limb-animation:${limb.id}`,
			boneIds: Object.freeze(segmentBoneIds(limb, rig)),
			functionalRole: limb.functionalRole,
			limbId: limb.id,
			phaseOffset,
			side: limb.side || "center",
			speedScale: positive(override.speedScale, 1),
			timeOffset: phaseOffset,
			type: "semantic-limb-animation-channel"
		});
	});
}

/**
 * Evaluates channel-local phases so one shared gait can drive independently timed limbs.
 * @param {Array<object>} channels Limb channels from `createLimbAnimationChannels`.
 * @param {number} time Normalized or continuously increasing gait time.
 * @returns {Array<object>} Per-limb time state preserving each channel's amplitude.
 */
export function evaluateLimbAnimationChannels(channels, time = 0) {
	const baseTime = finite(time, 0);
	return channels.map((channel) => {
		return Object.freeze({
			amplitudeScale: channel.amplitudeScale,
			boneIds: channel.boneIds,
			limbId: channel.limbId,
			phase: normalizedPhase(
				baseTime * channel.speedScale + channel.phaseOffset
			)
		});
	});
}

/** Finds the true Yetzirah bone ids generated from this limb's semantic segments. */
function segmentBoneIds(limb, rig) {
	const segmentIds = new Set(limb.segments.map((segment) => segment.id));
	return rig.bones.filter((bone) => {
		return segmentIds.has(bone.sourceAnatomyId);
	}).map((bone) => bone.id);
}

/** Uses existing contact-target order when available, otherwise stable limb order. */
function defaultPhase(limb, limbIndex, limbs, contactTargets) {
	const contactIndex = contactTargets.findIndex((target) => {
		return target.limbId === limb.id;
	});
	if (contactIndex >= 0) {
		return contactIndex / Math.max(1, contactTargets.length);
	}
	return limbIndex / Math.max(1, limbs.length);
}

/** Wraps arbitrary phase values into the normalized animation cycle. */
function normalizedPhase(value) {
	return ((value % 1) + 1) % 1;
}

/** Returns a finite number or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
