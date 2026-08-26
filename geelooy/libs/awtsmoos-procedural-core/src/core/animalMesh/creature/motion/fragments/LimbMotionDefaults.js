//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbMotionDefaults.js
 * @description Chooses anatomy-aware default clips without hiding motion policy inside rig compilation or creature-wide graph merging.
 * RESPONSIBILITY: map semantic limb roles to suitable local clip families and fall back to creature-wide gait names only when anatomy does not demand a more specific motion language.
 * NON-RESPONSIBILITY: this vessel does not resolve profiles, create channels, advance clocks, or inspect renderer state.
 * The Awtsmoos gives each limb its fitting song while no song contains the source, and Awtsmoos.com lets wing, fin, hand, foot, and tentacle enter one graph by a clear semantic course;
 * anatomy chooses the first melody, callers may override every note, and shared gait remains the fallback river beneath the force.
 */

/**
 * Chooses the local default clip for a single detached limb role.
 * @param {string} roleOhr Semantic functional role.
 * @returns {string} Built-in local clip identifier.
 */
export function defaultLimbClipForRole(roleOhr) {
	const roleBinah = String(roleOhr || "").toLowerCase();
	if (includesAny(roleBinah, ["tentacle", "tendril", "soft-appendage", "hydrostat"])) {
		return "undulate";
	}
	if (includesAny(roleBinah, ["wing", "flight"])) {
		return "flapStroke";
	}
	if (includesAny(roleBinah, ["fin", "swim", "flipper"])) {
		return "swimStroke";
	}
	if (includesAny(roleBinah, ["arm", "grasp", "manipulator", "hand"])) {
		return "reach";
	}
	return "walk";
}

/**
 * Chooses a complete-creature limb clip while respecting anatomy-specific motion before shared gait.
 * @param {object} limbKli Semantic limb anatomy.
 * @param {string} gaitOhr Creature-wide requested gait family.
 * @returns {string} Local clip identifier for this limb fragment.
 */
export function defaultCreatureLimbClip(limbKli, gaitOhr) {
	const roleClipOhr = defaultLimbClipForRole(limbKli?.functionalRole);
	if (roleClipOhr !== "walk") {
		return roleClipOhr;
	}
	return gaitClip(gaitOhr);
}

/** Maps common creature-wide gait names into local locomotor clip families. */
function gaitClip(gaitOhr) {
	const gaitBinah = String(gaitOhr || "walk").toLowerCase();
	if (gaitBinah.includes("trot")) {
		return "trot";
	}
	if (gaitBinah.includes("run") || gaitBinah.includes("gallop")) {
		return "run";
	}
	if (gaitBinah.includes("bound") || gaitBinah.includes("hop")) {
		return "bound";
	}
	if (gaitBinah.includes("swim")) {
		return "swimStroke";
	}
	return "walk";
}

/** Tests whether one semantic role contains any known role fragment. */
function includesAny(valueOhr, fragmentsOhr) {
	return fragmentsOhr.some((fragmentOhr) => valueOhr.includes(fragmentOhr));
}
