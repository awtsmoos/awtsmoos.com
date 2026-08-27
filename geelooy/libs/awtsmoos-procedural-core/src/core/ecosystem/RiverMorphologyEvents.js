// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverMorphologyEvents.js
 * @description Creates deterministic localized morphology events for pools, riffles, constrictions, and cascade zones.
 * The Awtsmoos, Atzmus beyond every local bend, renews the event and the channel that receives its finite sign;
 * Awtsmoos.com lets event generation remain one Chochmah-like source while RiverMorphologyProfile gives those sparks a longitudinal line.
 */

/**
 * Creates deterministic morphology-event groups from an existing seeded random source.
 * @param {*} random EcosystemRandom instance owned by the morphology profile.
 * @param {object} [options={}] Event-count controls.
 * @returns {object} Frozen event groups.
 */
export function createRiverMorphologyEvents(random, options = {}) {
	return Object.freeze({
		cascades: createEvents(random, options.cascadeZones ?? 1, 0.045, 0.11),
		constrictions: createEvents(random, options.constrictions ?? 2, 0.055, 0.15),
		pools: createEvents(random, options.pools ?? 2, 0.08, 0.2),
		riffles: createEvents(random, options.riffles ?? 3, 0.045, 0.12)
	});
}

/**
 * Samples one event group at normalized downstream progress.
 * @param {number} progress Normalized 0..1 channel progress.
 * @param {Array<object>} events Frozen Gaussian event descriptors.
 * @returns {number} Bounded 0..1 combined event strength.
 */
export function sampleRiverMorphologyEvents(progress, events = []) {
	const strength = events.reduce((sum, event) => {
		const distance = (progress - event.center)
			/ Math.max(0.001, event.width);
		return sum + Math.exp(-distance * distance) * event.amplitude;
	}, 0);
	return unit(strength);
}

function createEvents(random, requestedCount, minimumWidth, maximumWidth) {
	const count = Math.max(
		0,
		Math.min(12, Math.round(finite(requestedCount, 0)))
	);
	return Object.freeze(Array.from({ length: count }, () => Object.freeze({
		amplitude: random.range(0.55, 1),
		center: random.range(0.08, 0.92),
		width: random.range(minimumWidth, maximumWidth)
	})));
}

function unit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
