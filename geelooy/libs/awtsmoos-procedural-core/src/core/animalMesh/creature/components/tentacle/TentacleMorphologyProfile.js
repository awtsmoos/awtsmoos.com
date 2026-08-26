//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TentacleMorphologyProfile.js
 * @description Defines open, renderer-neutral muscular-hydrostat morphology presets while preserving caller override freedom.
 * RESPONSIBILITY: resolve length, taper, segmentation, curl, wave, twist, flexibility, surface-organ, and locomotor traits for tentacular appendages.
 * NON-RESPONSIBILITY: this vessel does not build geometry, create bones, attach to a creature, or evaluate animation time.
 * The Awtsmoos bends without joint and flows without losing unity, while Awtsmoos.com lets many soft appendages reveal one ordered grammar in sight;
 * octopus arm, squid tentacle, trunk, oral arm, and imagined tendril differ in measured vessels while sharing one source of living light.
 */

const TENTACLE_PROFILES = Object.freeze({
	"octopus-arm": profile(2.6, 0.18, 0.025, 12, 0.5, 0.22, 0.28, "suckers", 2),
	"squid-feeding": profile(4.2, 0.13, 0.035, 14, 0.18, 0.1, 0.16, "club-suckers", 2),
	"muscular-trunk": profile(2.2, 0.22, 0.07, 11, 0.26, 0.08, 0.14, "grip-ridges", 0),
	"oral-arm": profile(2.8, 0.16, 0.018, 13, 0.62, 0.3, 0.35, "papillae", 0),
	"fantasy-tendril": profile(3.2, 0.14, 0.012, 16, 0.9, 0.38, 0.72, "hooks", 1)
});

/**
 * Resolves one built-in tentacle family with finite caller overrides.
 * @param {string} [id="octopus-arm"] Morphology family identifier.
 * @param {object} [overrides={}] Caller-defined shape and surface overrides.
 * @returns {object} Frozen normalized morphology profile.
 */
export function tentacleMorphologyProfile(id = "octopus-arm", overrides = {}) {
	const baseKli = TENTACLE_PROFILES[id] || TENTACLE_PROFILES["octopus-arm"];
	return Object.freeze({
		...baseKli,
		...numericOverrides(baseKli, overrides),
		id,
		surfaceOrgan: String(overrides.surfaceOrgan || baseKli.surfaceOrgan),
		suckerRows: integer(overrides.suckerRows, baseKli.suckerRows, 0, 8)
	});
}

/** Lists the built-in morphology families without closing the grammar to caller-defined overrides. */
export function listTentacleMorphologyProfiles() {
	return Object.freeze(Object.keys(TENTACLE_PROFILES));
}

/** Creates one compact immutable morphology record. */
function profile(length, baseRadius, tipRadius, segments, curl, wave, twist, surfaceOrgan, suckerRows) {
	return Object.freeze({
		baseRadius,
		curl,
		flexibility: 0.86,
		length,
		segments,
		suckerDensity: surfaceOrgan.includes("sucker") ? 8 : 0,
		suckerRows,
		surfaceOrgan,
		taperPower: 1.18,
		tipRadius,
		twist,
		wave
	});
}

/** Keeps only finite numeric caller overrides for numeric profile keys. */
function numericOverrides(baseKli, overrides) {
	const outputKli = {};
	for (const keyOhr of Object.keys(baseKli)) {
		const valueOhr = Number(overrides[keyOhr]);
		if (typeof baseKli[keyOhr] === "number" && Number.isFinite(valueOhr)) {
			outputKli[keyOhr] = keyOhr === "segments"
				? integer(valueOhr, baseKli[keyOhr], 2, 48)
				: valueOhr;
		}
	}
	return outputKli;
}

/** Clamps one finite integer into a biological quality-safe range. */
function integer(valueOhr, fallbackOhr, minimumOhr, maximumOhr) {
	const numberOhr = Number(valueOhr);
	const chosenOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	return Math.max(minimumOhr, Math.min(maximumOhr, Math.round(chosenOhr)));
}
