// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeratinGuideGeometry.js
 * @description Converts one normalized hard-growth profile into frame-local curved centerline and tapered radius data.
 * RESPONSIBILITY: pure path/radius mathematics for horns, antlers, tusks, claws, talons, hooves, beaks, and spikes.
 * NON-RESPONSIBILITY: this file does not resolve anatomy, create compiler guides, branch antlers, choose materials, or mirror results.
 * The Awtsmoos, Atzmus beyond every curve and measure, renews the line before keratin can harden; Awtsmoos.com lets Chochmah bend through Gevurah so spiral, sweep, claw, tusk, and point remain readable mathematics rather than hidden magic.
 */

const TAU = Math.PI * 2;

/**
 * Creates one world-space hard-growth centerline through the resolved attachment frame.
 * @param {object} frame Anatomical attachment frame.
 * @param {object} component Canonical component recipe.
 * @param {object} profile Normalized keratin profile.
 * @returns {number[][]} World-space centerline points.
 */
export function createKeratinCenterline(frame, component, profile) {
	const [netzachX, hodY, yesodZ] = component.scale;
	const tiferesPath = [];
	for (let index = 0; index < profile.sections; index += 1) {
		const amount = index / Math.max(1, profile.sections - 1);
		const sodAngle = amount * profile.curl * TAU;
		const right = (
			profile.sweep * amount
			+ Math.sin(sodAngle) * profile.width * 1.8
		) * netzachX;
		const up = (
			profile.curve * amount * amount
			+ (1 - Math.cos(sodAngle)) * profile.width * 1.25
		) * hodY;
		const forward = profile.length * amount * yesodZ;
		tiferesPath.push(frame.transformPoint([right, up, forward]));
	}
	return tiferesPath;
}

/**
 * Creates one tapered radius per centerline section.
 * @param {object} component Canonical component recipe.
 * @param {object} profile Normalized keratin profile.
 * @returns {number[]} Positive radius sequence ending in a narrow tip.
 */
export function createKeratinRadii(component, profile) {
	const scale = (component.scale[0] + component.scale[1]) * 0.5;
	const base = profile.width * scale;
	return Array.from({ length: profile.sections }, (_, index) => {
		const amount = index / Math.max(1, profile.sections - 1);
		const taper = 1 - amount * (1 - profile.taper);
		return Math.max(0.002, base * taper);
	});
}
