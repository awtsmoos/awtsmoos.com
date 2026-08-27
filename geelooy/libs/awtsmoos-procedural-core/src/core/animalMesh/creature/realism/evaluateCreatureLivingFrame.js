// B"H
// Boruch Hashem
// Blessed is He
/** Living frame evaluation turns semantic biological recipes into animation data. */

function clamp(value, minimum = 0, maximum = 1) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}

function phase(id) {
	let value = 2166136261;
	for (const character of String(id)) {
		value ^= character.charCodeAt(0);
		value = Math.imul(value, 16777619);
	}
	return ((value >>> 0) / 4294967295) * Math.PI * 2;
}

function muscleFrame(actuator, time, controls) {
	const voluntary = controls.muscles?.[actuator.id]
		?? controls.roles?.[actuator.role]
		?? 0.28;
	const oscillation = Math.sin(time * actuator.activationSpeed + phase(actuator.id));
	const activation = clamp(voluntary + oscillation * Number(controls.reflexAmplitude ?? 0.08));
	return Object.freeze({
		actuatorId: actuator.id,
		boneId: actuator.boneId,
		activation,
		lengthScale: 1 - activation * 0.18,
		radiusScale: 1 + activation * actuator.bulge.radiusGain,
		force: actuator.maximumForce * activation,
		fatigue: clamp(activation * actuator.fatigueRate * Math.max(0, time))
	});
}

function breathingFrame(living, time, controls) {
	const profile = living.physiology.breathing;
	const effort = clamp(controls.breathingEffort ?? 1, 0, 2);
	return Object.freeze(profile.phaseOffsets.map((offset, index) => {
		const wave = Math.sin(time * profile.frequencyHertz * Math.PI * 2 + offset);
		return Object.freeze({
			sectionIndex: index,
			scale: 1 + wave * profile.amplitude * effort,
			wave
		});
	}));
}

function sensoryFrame(profile, time, controls) {
	const blinkRate = profile.blinkFrequencyHertz;
	const blinkPhase = (time * blinkRate + 0.17) % 1;
	const blink = blinkPhase > 0.9
		? Math.sin((blinkPhase - 0.9) / 0.1 * Math.PI)
		: 0;
	const attention = clamp(controls.attention ?? profile.attention);
	const saccadePhase = time * profile.gazeSaccadeFrequencyHertz * Math.PI * 2;
	return Object.freeze({
		blink: clamp(blink),
		pupilDilation: clamp(profile.pupilDilation + Number(controls.pupilOffset ?? 0)),
		gazeDirection: Object.freeze([
			Math.sin(saccadePhase) * 0.22 * attention,
			Math.sin(saccadePhase * 0.53 + 1.7) * 0.12 * attention,
			Math.sqrt(Math.max(0, 1 - 0.22 * 0.22 - 0.12 * 0.12))
		]),
		eyePartIds: profile.eyePartIds
	});
}

/**
 * Evaluates one deterministic living frame at explicit simulation time.
 * @param {Object} living - Compiled creature living artifacts.
 * @param {number} time - Seconds from a caller-owned clock.
 * @param {Object} controls - Optional voluntary and environmental controls.
 * @returns {Object} Bounded muscle, tissue, physiology, and sensory signals.
 */
export function evaluateCreatureLivingFrame(living, time = 0, controls = {}) {
	const seconds = Math.max(0, Number(time));
	const muscles = Object.freeze(living.muscles.actuators.map(
		(actuator) => muscleFrame(actuator, seconds, controls)
	));
	const circulation = living.physiology.circulation;
	const pulsePhase = seconds * circulation.heartRateBeatsPerMinute / 60 * Math.PI * 2;
	return Object.freeze({
		schema: "awtsmoos.creature-living-frame",
		sourceCreatureId: living.sourceCreatureId,
		sourceRigId: living.sourceRigId,
		time: seconds,
		muscles,
		tendons: Object.freeze(living.muscles.tendons.map((tendon, index) => Object.freeze({
			actuatorId: tendon.actuatorId,
			strain: clamp((muscles[index]?.activation ?? 0) * 0.12, 0, tendon.maximumStretch - 1)
		}))),
		breathing: breathingFrame(living, seconds, controls),
		pulse: Object.freeze({
			wave: Math.sin(pulsePhase),
			scale: 1 + Math.sin(pulsePhase) * circulation.pulseAmplitude,
			perfusion: circulation.perfusion
		}),
		sensory: sensoryFrame(living.physiology.sensory, seconds, controls),
		thermal: Object.freeze({
			coreTemperatureCelsius: living.physiology.thermal.coreTemperatureCelsius,
			vasodilation: living.physiology.thermal.vasodilation,
			heatProduction: living.physiology.thermal.heatProduction
		}),
		secondaryMotion: Object.freeze(living.muscles.secondaryMotion.map((item) => Object.freeze({
			partId: item.partId,
			angle: Math.sin(seconds * (2.1 + item.stiffness) + phase(item.partId)) * (1 - item.stiffness) * 0.32,
			damping: item.damping
		})))
	});
}
