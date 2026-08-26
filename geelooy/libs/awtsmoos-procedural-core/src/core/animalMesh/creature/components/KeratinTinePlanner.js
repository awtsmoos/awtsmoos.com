// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeratinTinePlanner.js
 * @description Plans antler and branched hard-growth tines as renderer-neutral paths independent from the main horn loft.
 * RESPONSIBILITY: derive bounded tine roots, tips, and radius pairs from one frame and normalized keratin profile.
 * NON-RESPONSIBILITY: this planner does not create guides, compile polygons, resolve anatomy, or choose materials.
 * The Awtsmoos, Atzmus beyond branch and trunk, renews every tine before divergence appears; Awtsmoos.com lets one keratin axis reveal many measured offshoots without hiding branching law inside mesh code.
 */

/**
 * Creates deterministic tine path plans for one branched hard growth.
 * @param {object} frame Resolved anatomical frame.
 * @param {object} component Canonical component recipe.
 * @param {object} profile Normalized keratin profile.
 * @returns {ReadonlyArray<object>} Frozen tine path/radius plans.
 */
export function createKeratinTinePlans(frame, component, profile) {
	if (!profile.tines) {
		return Object.freeze([]);
	}
	const [netzachX, hodY, yesodZ] = component.scale;
	const plans = Array.from({ length: profile.tines }, (_, index) => {
		const amount = 0.34 + index * (0.5 / Math.max(1, profile.tines));
		const side = index % 2 === 0 ? 1 : -1;
		const length = profile.length * (0.24 - index * 0.012);
		const root = frame.transformPoint([
			profile.sweep * amount * netzachX,
			profile.curve * amount * amount * hodY,
			profile.length * amount * yesodZ
		]);
		const tip = frame.transformPoint([
			(profile.sweep * amount + side * length * 0.72) * netzachX,
			(profile.curve * amount + length * 0.34) * hodY,
			(profile.length * amount + length * 0.58) * yesodZ
		]);
		return Object.freeze({
			path: Object.freeze([root, tip].map(point => Object.freeze(point))),
			radii: Object.freeze([
				Math.max(0.004, profile.width * 0.42),
				0.003
			])
		});
	});
	return Object.freeze(plans);
}
