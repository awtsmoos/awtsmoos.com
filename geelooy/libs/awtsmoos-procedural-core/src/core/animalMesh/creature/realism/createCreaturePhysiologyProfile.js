// B"H
// Boruch Hashem
// Blessed is He
/** Breathing, circulation, heat, gaze, and blinking animate generated life. */

function clamp(value, minimum = 0, maximum = 1) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}

/** Creates deterministic physiology controls from anatomy and activity. */
export function createCreaturePhysiologyProfile(creature, rig, options = {}) {
	const activity = clamp(options.activity ?? 0.35);
	const stress = clamp(options.stress ?? 0.12);
	const mass = Math.max(0.1, creature.body.sections.reduce(
		(sum, section) => sum + section.massContribution,
		0
	));
	const supportCount = creature.limbs.filter(
		(limb) => limb.contactCapabilities.length > 0
	).length;
	const eyes = creature.parts.filter((part) => /eye/.test(part.category));
	const heartRate = 48 + activity * 92 + stress * 38;
	return Object.freeze({
		schema: "awtsmoos.creature-physiology-profile",
		sourceCreatureId: creature.id,
		breathing: Object.freeze({
			frequencyHertz: 0.18 + activity * 0.52 + stress * 0.22,
			amplitude: 0.025 + activity * 0.035,
			phaseOffsets: Object.freeze(creature.body.sections.map((_, index) => index * 0.035)),
			lungCount: Math.max(1, Math.round(mass / 3.5)),
			volumePreserving: true
		}),
		circulation: Object.freeze({
			heartRateBeatsPerMinute: heartRate,
			pulseAmplitude: 0.004 + activity * 0.009,
			perfusion: clamp(0.72 + activity * 0.22 - stress * 0.08),
			boneCount: rig.bones.length
		}),
		thermal: Object.freeze({
			coreTemperatureCelsius: Number(options.coreTemperatureCelsius ?? 37.2),
			heatProduction: mass * (0.08 + activity * 0.24),
			surfaceCooling: 0.42 + supportCount * 0.025,
			vasodilation: clamp(activity * 0.65 + stress * 0.18)
		}),
		sensory: Object.freeze({
			eyePartIds: Object.freeze(eyes.map((part) => part.id)),
			blinkFrequencyHertz: 0.12 + stress * 0.26,
			gazeSaccadeFrequencyHertz: 0.35 + activity * 0.45,
			pupilDilation: clamp(0.35 + stress * 0.5),
			attention: clamp(options.attention ?? 0.68)
		}),
		metabolism: Object.freeze({ basal: mass * 0.7, active: mass * activity * 2.1 })
	});
}
