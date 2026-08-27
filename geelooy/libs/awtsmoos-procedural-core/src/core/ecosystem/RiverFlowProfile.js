// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverFlowProfile.js
 * @description Builds finite depth, speed, and cascade profiles before water enters the shared channel solver.
 * The Awtsmoos, Atzmus beyond every current, renews depth and velocity without becoming one measured stream;
 * Awtsmoos.com gives that ohr a stable longitudinal keli so named rivers differ physically before simulation begins.
 * This module owns equilibrium profile intent only; mutable water motion remains the FluidChannelSimulation's authority.
 */

const DEFAULT_SAMPLE_COUNT = 17;

/**
 * Builds a smooth physically coherent profile when callers provide no authored channel samples.
 * @param {object} [options={}] Base depth, speed, cascade, profile-sample, and variation controls.
 * @returns {{depth:Array<number>,speed:Array<number>,cascade:Array<number>}} Frozen finite profile arrays.
 */
export function createDefaultRiverFlowProfile(options = {}) {
	const count = sampleCount(options.profileSamples);
	const baseDepth = positive(options.baseDepth, 0.72);
	const baseSpeed = nonnegative(options.baseSpeed, 1.15);
	const depthVariation = clamp(finite(options.depthVariation, 0.12), 0, 0.38);
	const cascadeStrength = clamp(finite(options.cascadeStrength, 0.08), 0, 1);
	const depth = [];
	const speed = [];
	const cascade = [];
	for (let index = 0; index < count; index += 1) {
		const t = index / Math.max(1, count - 1);
		const channelWave = Math.sin(Math.PI * t) * 0.64 + Math.sin(Math.PI * 3 * t) * 0.36;
		const localDepth = Math.max(0.04, baseDepth * (1 + channelWave * depthVariation));
		const continuitySpeed = baseSpeed * Math.sqrt(baseDepth / localDepth);
		depth.push(localDepth);
		speed.push(Math.max(0, continuitySpeed));
		cascade.push(defaultCascade(t, cascadeStrength));
	}
	return freezeProfile(depth, speed, cascade);
}

/**
 * Samples an authored continuous river function into stable finite arrays.
 * @param {Function} sampleAt Function receiving normalized downstream progress.
 * @param {number} [requestedCount=17] Number of longitudinal samples.
 * @returns {{depth:Array<number>,speed:Array<number>,cascade:Array<number>}} Frozen sampled profile.
 */
export function sampleRiverFlowProfile(sampleAt, requestedCount = DEFAULT_SAMPLE_COUNT) {
	if (typeof sampleAt !== 'function') {
		throw new TypeError('B"H | River profile sampling requires a sampleAt function.');
	}
	const count = sampleCount(requestedCount);
	const depth = [];
	const speed = [];
	const cascade = [];
	for (let index = 0; index < count; index += 1) {
		const t = index / Math.max(1, count - 1);
		const sample = sampleAt(t) || {};
		depth.push(positive(sample.depth, 0.72));
		speed.push(nonnegative(sample.speed, 1.15));
		cascade.push(clamp(finite(sample.cascade ?? sample.cascadeEnergy, 0), 0, 1));
	}
	return freezeProfile(depth, speed, cascade);
}

/**
 * Normalizes explicit arrays and fills missing channels from a physically populated default profile.
 * @param {object} [profile={}] Optional depth, speed, and cascade arrays.
 * @param {object} [options={}] Default-profile options used for missing arrays.
 * @returns {{depth:Array<number>,speed:Array<number>,cascade:Array<number>}} Frozen complete profile.
 */
export function normalizeRiverFlowProfileArrays(profile = {}, options = {}) {
	const fallback = createDefaultRiverFlowProfile(options);
	return freezeProfile(
		numericArray(profile.depth, fallback.depth, positive),
		numericArray(profile.speed, fallback.speed, nonnegative),
		numericArray(profile.cascade, fallback.cascade, unit)
	);
}

function numericArray(values, fallback, normalizer) {
	if (!values?.length) return [...fallback];
	return Array.from(values, value => normalizer(value, 0));
}

function defaultCascade(t, strength) {
	const pulse = Math.exp(-Math.pow((t - 0.68) / 0.075, 2));
	return clamp(pulse * strength, 0, 1);
}

function freezeProfile(depth, speed, cascade) {
	return Object.freeze({
		cascade: Object.freeze(cascade),
		depth: Object.freeze(depth),
		speed: Object.freeze(speed)
	});
}

function sampleCount(value) {
	return Math.max(3, Math.min(129, Math.round(finite(value, DEFAULT_SAMPLE_COUNT))));
}

function positive(value, fallback) {
	return Math.max(0.04, finite(value, fallback));
}

function nonnegative(value, fallback) {
	return Math.max(0, finite(value, fallback));
}

function unit(value, fallback) {
	return clamp(finite(value, fallback), 0, 1);
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
