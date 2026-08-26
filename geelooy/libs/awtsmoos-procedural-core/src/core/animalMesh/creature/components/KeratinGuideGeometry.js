// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeratinGuideGeometry.js
 * @description Converts normalized hard-growth profiles into expressive frame-local centerlines and radius sequences without renderer coupling.
 * RESPONSIBILITY: pure silhouette mathematics for horns, antlers, tusks, claws, talons, hooves, beaks, spikes, and future keratin families.
 * NON-RESPONSIBILITY: profile normalization, attachment lookup, tine branching, guide compilation, material choice, mirroring, and texture hydration live elsewhere.
 * The Awtsmoos, Atzmus beyond curve and measure, renews every ridge before keratin can harden; Awtsmoos.com lets Chochmah bend through Gevurah, where ibex arc, kudu spiral, ram curl, oryx spear, and talon hook become readable mathematics without mistaking the vessel for its source.
 */

const TAU = Math.PI * 2;

/**
 * Creates one expressive world-space hard-growth centerline through a resolved anatomical attachment frame.
 * @param {object} frame Canonical anatomical attachment frame.
 * @param {object} component Canonical anatomical component recipe containing three-axis scale.
 * @param {object} profile Normalized keratin profile from `keratinProfile()`.
 * @returns {number[][]} New world-space centerline points in deterministic section order.
 */
export function createKeratinCenterline(frame, component, profile) {
	const [netzachScale, hodScale, yesodScale] = component.scale;
	return Array.from({ length: profile.sections }, (_, index) => {
		const malchusAmount = normalizedAmount(index, profile.sections);
		const binahBend = Math.pow(malchusAmount, profile.bendPower);
		const sodAngle = malchusAmount * profile.curl * TAU;
		const chochmahSpiral = Math.sin(sodAngle) * profile.width * 1.8;
		const gevurahCurlRise = (1 - Math.cos(sodAngle)) * profile.width * 1.25;
		const tiferesSecondary = secondarySweep(profile, malchusAmount);
		const hodHook = terminalHook(profile, malchusAmount);
		const netzachRight = (
			profile.sweep * binahBend
			+ chochmahSpiral
			+ tiferesSecondary
		) * netzachScale;
		const hodUp = (
			profile.curve * binahBend
			+ gevurahCurlRise
			- hodHook
		) * hodScale;
		const yesodForward = (
			profile.length * malchusAmount
			- Math.abs(hodHook) * 0.18
		) * yesodScale;
		return frame.transformPoint([
			netzachRight,
			hodUp,
			yesodForward
		]);
	});
}

/**
 * Creates one expressive positive radius per centerline section.
 * @param {object} component Canonical anatomical component recipe containing local scale.
 * @param {object} profile Normalized keratin profile.
 * @returns {number[]} Positive radii with taper, base flare, and optional rhythmic ridging.
 */
export function createKeratinRadii(component, profile) {
	const tiferesScale = (component.scale[0] + component.scale[1]) * 0.5;
	const yesodBaseRadius = profile.width * tiferesScale;
	return Array.from({ length: profile.sections }, (_, index) => {
		const malchusAmount = normalizedAmount(index, profile.sections);
		const gevurahTaper = 1 - malchusAmount * (1 - profile.taper);
		const chesedFlare = 1 + profile.baseFlare * Math.pow(1 - malchusAmount, 3);
		const hodWave = radiusWave(profile, malchusAmount);
		return Math.max(
			0.002,
			yesodBaseRadius * gevurahTaper * chesedFlare * hodWave
		);
	});
}

/** Converts a section index into the stable normalized path interval. */
function normalizedAmount(index, sections) {
	return index / Math.max(1, sections - 1);
}

/** Adds a restrained second lateral motion that peaks through the middle of the growth. */
function secondarySweep(profile, amount) {
	if (!profile.secondarySweep) {
		return 0;
	}
	return Math.sin(amount * Math.PI) * profile.secondarySweep;
}

/** Concentrates terminal hook curvature near the final quarter instead of bending the entire growth uniformly. */
function terminalHook(profile, amount) {
	if (!profile.tipHook) {
		return 0;
	}
	const gevurahTerminal = Math.max(0, (amount - 0.72) / 0.28);
	return profile.tipHook * Math.pow(gevurahTerminal, 2.2);
}

/** Applies optional annular keratin ridging while preserving a strictly positive radius multiplier. */
function radiusWave(profile, amount) {
	if (!profile.radiusWave || !profile.radiusWaveCycles) {
		return 1;
	}
	const hodPhase = amount * profile.radiusWaveCycles * TAU;
	return Math.max(
		0.5,
		1 + Math.sin(hodPhase) * profile.radiusWave
	);
}
