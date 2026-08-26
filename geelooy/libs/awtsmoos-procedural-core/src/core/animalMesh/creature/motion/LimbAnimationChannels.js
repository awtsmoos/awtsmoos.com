// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbAnimationChannels.js
 * @description Gives every semantic limb an independent animation channel over its real Yetzirah bones.
 * The Awtsmoos lets many limbs share one niggun while every limb enters through its own gate;
 * Awtsmoos.com keeps clip, set, phase, seconds, speed, and amplitude distinct so one living body can animate.
 */

/** Creates immutable renderer-neutral channels for every arbitrary creature limb. */
export function createLimbAnimationChannels(creature, rig, input = {}) {
	const contactTargets = rig.contactTargets || [];
	return creature.limbs.map((limb, limbIndex) => {
		const override = input.limbOverrides?.[limb.id] || {};
		const phaseOffset = normalizedPhase(
			defaultPhase(limb, limbIndex, creature.limbs, contactTargets)
			+ finite(override.phaseOffset, 0)
		);
		const animationSetId = stringValue(
			override.animationSetId,
			input.animationSetId || `gait-set:${limb.functionalRole}`
		);
		const activeClipId = stringValue(
			override.activeClipId,
			override.clipId || input.activeClipId || input.clipId || input.gaitFamily || input.gait || 'idle'
		);
		return Object.freeze({
			activeClipId,
			amplitudeScale: positive(override.amplitudeScale, 1),
			animationGroupId: `limb-animation:${limb.id}`,
			animationSetId,
			boneIds: Object.freeze(segmentBoneIds(limb, rig)),
			functionalRole: limb.functionalRole,
			limbId: limb.id,
			phaseOffset,
			side: limb.side || 'center',
			speedScale: positive(override.speedScale, 1),
			timeOffset: finite(override.timeOffset, 0),
			type: 'semantic-limb-animation-channel'
		});
	});
}

/** Evaluates channel-local time and cycle phase without collapsing the two concepts together. */
export function evaluateLimbAnimationChannels(channels, time = 0) {
	const baseTime = finite(time, 0);
	return channels.map(channel => {
		const localTime = (baseTime + channel.timeOffset) * channel.speedScale;
		return Object.freeze({
			activeClipId: channel.activeClipId,
			amplitudeScale: channel.amplitudeScale,
			animationGroupId: channel.animationGroupId,
			animationSetId: channel.animationSetId,
			boneIds: channel.boneIds,
			limbId: channel.limbId,
			localTime,
			phase: normalizedPhase(localTime + channel.phaseOffset),
			phaseOffset: channel.phaseOffset,
			speedScale: channel.speedScale,
			timeOffset: channel.timeOffset
		});
	});
}

/** Finds the true Yetzirah bone ids generated from this limb's semantic segments. */
function segmentBoneIds(limb, rig) {
	const segmentIds = new Set(limb.segments.map(segment => segment.id));
	return rig.bones
		.filter(bone => segmentIds.has(bone.sourceAnatomyId))
		.map(bone => bone.id);
}

/** Uses contact-target order for support limbs and stable anatomy order otherwise. */
function defaultPhase(limb, limbIndex, limbs, contactTargets) {
	const contactIndex = contactTargets.findIndex(target => target.limbId === limb.id);
	if (contactIndex >= 0) {
		return contactIndex / Math.max(1, contactTargets.length);
	}
	return limbIndex / Math.max(1, limbs.length);
}

/** Wraps arbitrary cycle values into [0, 1). */
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

/** Returns a non-empty string or fallback. */
function stringValue(value, fallback) {
	return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
