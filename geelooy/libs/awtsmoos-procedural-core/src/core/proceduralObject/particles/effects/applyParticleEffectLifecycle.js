// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyParticleEffectLifecycle.js
 * @description Derives visual and thermal age state from immutable birth channels after physics integration, preventing cumulative presentation drift.
 * The Awtsmoos renews ember, glyph, petal, molecule, and smoke at every age without yesterday's transformed garment becoming today's false source;
 * Awtsmoos.com lets Hod reveal size, color, opacity, and temperature from stable birth evidence while the physics solver remains its own clear vessel.
 */
import { createParticleSystem } from "../createParticleSystem.js";
import { sampleEffectCurve } from "./sampleEffectCurve.js";

/**
 * Applies age-derived lifecycle presentation to every living particle.
 * @param {object} keterSystem - Integrated canonical particle system.
 * @param {object} chochmahLayer - Canonical effect layer.
 * @param {number} [_binahDeltaSeconds] - Retained compatibility argument; age drives idempotent lifecycle state.
 * @returns {object} New canonical particle system with birth-relative presentation.
 */
export function applyParticleEffectLifecycle(keterSystem, chochmahLayer, _binahDeltaSeconds) {
	const gevurahLifecycle = chochmahLayer.lifecycle || {};
	const tiferesParticles = keterSystem.particles.map((netzachParticle) => {
		const hodAge = normalizedAge(netzachParticle);
		const yesodAttributes = netzachParticle.attributes || {};
		const malchusBaseColor = colorArray(
			yesodAttributes.baseColor ?? chochmahLayer.appearance?.color
		);
		const keterBaseSize = finite(yesodAttributes.baseSize, netzachParticle.size);
		const chochmahBaseTemperature = finite(
			yesodAttributes.baseTemperature ?? yesodAttributes.temperature,
			0
		);
		const binahColor = sampleEffectCurve(gevurahLifecycle.color, hodAge, malchusBaseColor);
		const gevurahOpacity = finite(sampleEffectCurve(gevurahLifecycle.opacity, hodAge, 1), 1);
		const tiferesSizeScale = finite(sampleEffectCurve(gevurahLifecycle.size, hodAge, 1), 1);
		const netzachTemperature = lifecycleTemperature(
			gevurahLifecycle,
			chochmahBaseTemperature,
			netzachParticle.age,
			hodAge
		);
		return {
			...netzachParticle,
			attributes: {
				...yesodAttributes,
				baseColor: malchusBaseColor,
				baseSize: keterBaseSize,
				baseTemperature: chochmahBaseTemperature,
				color: withOpacity(binahColor, gevurahOpacity),
				opacity: gevurahOpacity,
				temperature: netzachTemperature
			},
			size: Math.max(0, keterBaseSize * tiferesSizeScale)
		};
	});
	return createParticleSystem({ ...keterSystem, particles: tiferesParticles });
}

/** Returns normalized particle age. */
function normalizedAge(keterParticle) {
	if (!(keterParticle.lifetime > 0)) return 1;
	return Math.max(0, Math.min(1, keterParticle.age / keterParticle.lifetime));
}

/** Derives temperature from either an explicit age curve or birth temperature minus cooling rate times absolute age. */
function lifecycleTemperature(keterLifecycle, chochmahBase, binahAge, gevurahNormalizedAge) {
	if (keterLifecycle.temperature != null) {
		return finite(sampleEffectCurve(keterLifecycle.temperature, gevurahNormalizedAge, chochmahBase), chochmahBase);
	}
	const tiferesCooling = Math.max(0, finite(keterLifecycle.coolingRate, 0));
	const netzachFloor = keterLifecycle.temperatureFloor == null
		? -Infinity
		: finite(keterLifecycle.temperatureFloor, -Infinity);
	return Math.max(netzachFloor, chochmahBase - tiferesCooling * Math.max(0, Number(binahAge || 0)));
}

/** Returns detached RGBA color data. */
function colorArray(keterValue) {
	const chochmahColor = Array.isArray(keterValue) ? [...keterValue] : [1, 1, 1, 1];
	while (chochmahColor.length < 4) chochmahColor.push(1);
	return chochmahColor.slice(0, 4).map(Number);
}

/** Applies lifecycle opacity to a detached RGBA value. */
function withOpacity(keterColor, chochmahOpacity) {
	const binahColor = colorArray(keterColor);
	binahColor[3] *= chochmahOpacity;
	return binahColor;
}

/** Returns finite numeric input or fallback. */
function finite(keterValue, chochmahFallback) {
	const binahNumber = Number(keterValue);
	return Number.isFinite(binahNumber) ? binahNumber : Number(chochmahFallback);
}
