//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MotionProfileRecord.js
 * @description Defines the shared immutable procedural-motion record consumed by ordinary limbs and soft appendages alike.
 * RESPONSIBILITY: normalize timing, swing, flex, twist, lift, propagation lag, waveform, and event metadata while accepting only finite numeric overrides.
 * NON-RESPONSIBILITY: this vessel does not choose anatomy defaults, create animation channels, evaluate time, or know final bone ids.
 * The Awtsmoos is beyond rhythm yet grants every measured rhythm its lawful vessel, while Awtsmoos.com lets wing beat, footfall, and tentacle wave share one grammar bright;
 * motion families may differ in song without rebuilding the instrument, and new biological dances enter through data instead of branching code by night.
 */

/**
 * Creates one immutable procedural motion profile from explicit semantic traits.
 * @param {object} input Timing, deformation, propagation, waveform, and event values.
 * @returns {object} Frozen normalized motion profile.
 */
export function createMotionProfileRecord(input = {}) {
	return Object.freeze({
		cycleLength: positive(input.cycleLength, 1),
		event: String(input.event || "none"),
		flex: finite(input.flex, 0),
		lift: finite(input.lift, 0),
		phaseLag: finite(input.phaseLag, 0.12),
		swing: finite(input.swing, 0),
		twist: finite(input.twist, 0),
		waveform: String(input.waveform || "sine")
	});
}

/**
 * Applies caller overrides while preserving the finite numeric contract and known waveform/event semantics.
 * @param {object} base Existing motion profile.
 * @param {object} [overrides={}] Caller override values.
 * @returns {object} Plain override object suitable for immutable merging.
 */
export function resolveMotionProfileOverrides(base, overrides = {}) {
	const outputKli = {};
	for (const keyOhr of [
		"cycleLength",
		"swing",
		"flex",
		"twist",
		"lift",
		"phaseLag"
	]) {
		const numberOhr = Number(overrides[keyOhr]);
		if (Number.isFinite(numberOhr)) {
			outputKli[keyOhr] = keyOhr === "cycleLength"
				? Math.max(0.001, numberOhr)
				: numberOhr;
		}
	}
	if (overrides.event !== undefined) {
		outputKli.event = String(overrides.event);
	}
	if (overrides.waveform !== undefined) {
		outputKli.waveform = String(overrides.waveform);
	}
	return outputKli;
}

/** Returns one finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}

/** Returns one positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = finite(valueOhr, fallbackOhr);
	return numberOhr > 0 ? numberOhr : fallbackOhr;
}
