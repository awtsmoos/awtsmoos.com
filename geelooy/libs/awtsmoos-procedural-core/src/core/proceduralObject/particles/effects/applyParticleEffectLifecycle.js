// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyParticleEffectLifecycle.js
 * @description Applies visual-age curves and thermal cooling after physics integration while preserving the canonical immutable particle-system shape.
 * The Awtsmoos renews ember, smoke, glyph, petal, and molecule at every finite age; Awtsmoos.com lets Hod reveal color, opacity, size, and cooling,
 * while the motion solver remains untouched and render adapters receive ordinary particle attributes rather than preset-specific hidden state.
 */
import { createParticleSystem } from "../createParticleSystem.js";
import { sampleEffectCurve } from "./sampleEffectCurve.js";

/**
 * Applies lifecycle curves to every living particle in one effect layer.
 * @param {object} keterSystem - Integrated canonical particle system.
 * @param {object} chochmahLayer - Canonical effect layer.
 * @param {number} binahDeltaSeconds - Simulation interval used for cooling.
 * @returns {object} New canonical particle system.
 */
export function applyParticleEffectLifecycle(keterSystem, chochmahLayer, binahDeltaSeconds) {
	const gevurahLifecycle = chochmahLayer.lifecycle || {};
	const tiferesParticles = keterSystem.particles.map((netzachParticle) => {
		const hodAge = netzachParticle.lifetime > 0
			? Math.max(0, Math.min(1, netzachParticle.age / netzachParticle.lifetime))
			: 1;
		const yesodBaseColor = netzachParticle.attributes?.baseColor
			?? chochmahLayer.appearance?.color
			?? [1, 1, 1, 1];
		const malchusColor = sampleEffectCurve(gevurahLifecycle.color, hodAge, yesodBaseColor);
		const keterOpacity = Number(sampleEffectCurve(gevurahLifecycle.opacity, hodAge, 1));
		const chochmahSizeScale = Number(sampleEffectCurve(gevurahLifecycle.size, hodAge, 1));
		const binahTemperature = cooledTemperature(
			netzachParticle.attributes?.temperature,
			gevurahLifecycle.coolingRate,
			binahDeltaSeconds
		);
		return {
			...netzachParticle,
			attributes: {
				...netzachParticle.attributes,
				color: withOpacity(malchusColor, keterOpacity),
				opacity: keterOpacity,
				temperature: binahTemperature
			},
			size: Math.max(0, netzachParticle.size * chochmahSizeScale)
		};
	});
	return createParticleSystem({ ...keterSystem, particles: tiferesParticles });
}

/** Applies a non-negative cooling rate while preserving absent thermal channels. */
function cooledTemperature(keterValue, chochmahCoolingRate, binahDeltaSeconds) {
	if (!Number.isFinite(Number(keterValue))) return keterValue;
	const gevurahCooling = Math.max(0, Number(chochmahCoolingRate || 0));
	return Number(keterValue) - gevurahCooling * Math.max(0, Number(binahDeltaSeconds || 0));
}

/** Multiplies color alpha by lifecycle opacity while preserving RGB channels. */
function withOpacity(keterColor, chochmahOpacity) {
	const binahArray = Array.isArray(keterColor) ? [...keterColor] : [1, 1, 1, 1];
	while (binahArray.length < 4) binahArray.push(1);
	binahArray[3] = Number(binahArray[3] ?? 1) * chochmahOpacity;
	return binahArray;
}
