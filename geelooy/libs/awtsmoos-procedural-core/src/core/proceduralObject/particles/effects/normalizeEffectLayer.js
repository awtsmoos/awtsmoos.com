// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeEffectLayer.js
 * @description Converts one friendly effect layer into immutable data understood by the mature Awtsmoos particle primitives.
 * The Awtsmoos is one while flame, smoke, glyph, atom, petal, and spark appear as different garments; Awtsmoos.com lets Binah normalize them
 * through the same schedule, spawn, force, lifecycle, and appearance covenant so the public API grows wider without the engine becoming tangled.
 */
import { effectValueRange } from "./effectValueRange.js";
import { freezeEffectData } from "./freezeEffectData.js";
import { scaleEffectCapacity, scaleEffectCount } from "./particleEffectQuality.js";
import { semanticEffectSeed } from "./semanticEffectSeed.js";

/**
 * Normalizes one declarative effect layer.
 * @param {object} keterInput - Friendly layer data.
 * @param {number} chochmahIndex - Stable declaration index.
 * @param {string|number} binahEffectSeed - Parent effect seed.
 * @param {object} gevurahQuality - Canonical effect-quality profile.
 * @returns {object} Immutable canonical layer.
 */
export function normalizeEffectLayer(keterInput = {}, chochmahIndex = 0, binahEffectSeed = 1, gevurahQuality) {
	const tiferesId = String(keterInput.id || `layer-${chochmahIndex}`);
	const netzachSeed = semanticEffectSeed(binahEffectSeed, tiferesId);
	const hodSchedule = normalizeSchedule(keterInput.schedule, keterInput.rate, gevurahQuality);
	return freezeEffectData({
		appearance: keterInput.appearance || { kind: "sprite" },
		capacity: scaleEffectCapacity(keterInput.capacity ?? 256, gevurahQuality),
		emitter: {
			attributes: keterInput.attributes || {},
			direction: keterInput.direction || [0, 1, 0],
			lifetime: effectValueRange(keterInput.lifetime, [0.8, 1.4]),
			mass: effectValueRange(keterInput.mass, [1, 1]),
			position: keterInput.position || [0, 0, 0],
			size: effectValueRange(keterInput.size, [1, 1]),
			speed: effectValueRange(keterInput.speed, [0.8, 1.2]),
			spread: Math.max(0, Number(keterInput.spread ?? 0))
		},
		forces: keterInput.forces || [],
		id: tiferesId,
		initialBurst: scaleEffectCount(keterInput.initialBurst ?? 0, gevurahQuality),
		lifecycle: keterInput.lifecycle || {},
		schedule: hodSchedule,
		seed: netzachSeed,
		spawn: keterInput.spawn || { kind: "point" }
	});
}

/** Scales schedule rates and burst counts through the shared quality budget. */
function normalizeSchedule(keterSchedule, chochmahRate, binahQuality) {
	const gevurahSource = keterSchedule || {
		rate: chochmahRate ?? 0,
		type: "continuous"
	};
	const tiferesBursts = (gevurahSource.bursts || []).map((burst) => ({
		...burst,
		count: scaleEffectCount(burst.count ?? 1, binahQuality)
	}));
	return {
		...gevurahSource,
		bursts: tiferesBursts,
		rate: Number(gevurahSource.rate ?? 0) * binahQuality.emission
	};
}
