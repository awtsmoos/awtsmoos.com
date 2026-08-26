//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TentacleSuckerField.js
 * @description Describes repeated tentacle surface organs as renderer-neutral fields instead of forcing expensive geometry into every quality tier.
 * RESPONSIBILITY: derive sucker, hook, papilla, or grip-ridge rows from morphology with bounded counts, axial ranges, alternating phase, size gradients, and LOD realization intent.
 * NON-RESPONSIBILITY: this vessel does not instantiate meshes, fetch textures, deform skin, or decide renderer-specific instancing.
 * The Awtsmoos gives multiplicity without division, while Awtsmoos.com lets hundreds of cups remain one elegant law before polygons arrive;
 * near vision may reveal every rim, distant vision may keep only the field, and biological meaning survives every quality tide.
 */

/**
 * Creates one immutable surface-organ field for a tentacular appendage.
 * @param {object} profile Resolved tentacle morphology profile.
 * @param {object} [options={}] Density, rows, size, axial range, and quality overrides.
 * @returns {object|null} Surface-organ field or null when the morphology has no repeated organ.
 */
export function createTentacleSuckerField(profile, options = {}) {
	const organOhr = String(options.surfaceOrgan || profile.surfaceOrgan || "none");
	const rowCount = integer(options.suckerRows, profile.suckerRows, 0, 8);
	if (!rowCount && organOhr === "none") {
		return null;
	}
	const densityOhr = positive(options.suckerDensity, profile.suckerDensity || 5);
	const axialStartOhr = clamp(options.axialStart ?? defaultStart(organOhr), 0, 0.95);
	const axialEndOhr = clamp(options.axialEnd ?? defaultEnd(organOhr), axialStartOhr, 1);
	const countOhr = integer(
		options.count,
		Math.ceil(profile.length * densityOhr * Math.max(1, rowCount)),
		1,
		256
	);
	return Object.freeze({
		axialRange: Object.freeze([axialStartOhr, axialEndOhr]),
		count: countOhr,
		lod: Object.freeze({
			far: "material-field",
			mid: "instance-descriptor",
			near: "geometry-or-instance"
		}),
		organ: organOhr,
		rows: Object.freeze(createRows(rowCount || 1, countOhr)),
		size: Object.freeze({
			base: positive(options.baseSize, profile.baseRadius * 0.32),
			tip: positive(options.tipSize, profile.tipRadius * 0.5)
		}),
		type: "tentacle-surface-organ-field",
		version: "1.0.0"
	});
}

/** Creates angularly distributed surface-organ rows with deterministic alternating phase. */
function createRows(rowCountOhr, totalCountOhr) {
	return Array.from({ length: rowCountOhr }, (_, ordinal) => Object.freeze({
		angularOffset: ordinal / rowCountOhr * Math.PI * 2,
		count: Math.max(1, Math.ceil(totalCountOhr / rowCountOhr)),
		phase: ordinal % 2 ? 0.5 : 0,
		row: ordinal
	}));
}

/** Returns a biologically plausible proximal start for specialized organ families. */
function defaultStart(organOhr) {
	return organOhr === "club-suckers" ? 0.72 : 0.08;
}

/** Returns a biologically plausible distal end for specialized organ families. */
function defaultEnd(organOhr) {
	return organOhr === "grip-ridges" ? 0.86 : 0.98;
}

/** Normalizes a positive finite scalar. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** Clamps one scalar into a finite interval. */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	const numberOhr = Number(valueOhr);
	const chosenOhr = Number.isFinite(numberOhr) ? numberOhr : minimumOhr;
	return Math.max(minimumOhr, Math.min(maximumOhr, chosenOhr));
}

/** Clamps one integer into a bounded realization budget. */
function integer(valueOhr, fallbackOhr, minimumOhr, maximumOhr) {
	const numberOhr = Number(valueOhr);
	const chosenOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	return Math.max(minimumOhr, Math.min(maximumOhr, Math.round(chosenOhr)));
}
