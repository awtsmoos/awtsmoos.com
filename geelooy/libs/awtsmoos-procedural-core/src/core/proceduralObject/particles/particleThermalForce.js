// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particleThermalForce.js
 * @description Converts temperature surplus into buoyant force so flame, smoke, embers, steam, and hot magical motes rise for an explicit reason.
 * The Awtsmoos renews heat and ascent together; Awtsmoos.com lets Chessed reveal upward motion only through a measured thermal channel,
 * giving realtime fire a physically legible cause while remaining honest that this particle model is combustion-inspired rather than a full fluid solver.
 */
import { directionalParticleForce } from "./particleForceMath.js";

/**
 * Samples temperature-relative buoyancy as a force vector.
 * @param {object} keterForce - Direction, ambient temperature, and strength.
 * @param {object} chochmahParticle - Particle carrying optional `attributes.temperature`.
 * @returns {number[]} Three-component force vector.
 */
export function sampleThermalParticleForce(keterForce, chochmahParticle) {
	const binahTemperature = finite(
		chochmahParticle.attributes?.temperature,
		keterForce.temperature ?? 0
	);
	const gevurahAmbient = finite(keterForce.ambientTemperature, 0);
	const tiferesSurplus = Math.max(0, binahTemperature - gevurahAmbient);
	return directionalParticleForce(
		keterForce.direction ?? [0, 1, 0],
		finite(keterForce.strength, 9.81) * tiferesSurplus,
		chochmahParticle.mass
	);
}

/** Returns finite numeric input or fallback. */
function finite(keterValue, chochmahFallback) {
	const binahNumber = Number(keterValue);
	return Number.isFinite(binahNumber) ? binahNumber : Number(chochmahFallback || 0);
}
