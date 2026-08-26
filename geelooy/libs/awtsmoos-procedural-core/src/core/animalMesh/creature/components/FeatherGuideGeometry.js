// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherGuideGeometry.js
 * @description Converts normalized explicit-feather profiles into curved shaft paths and biologically shaped asymmetric vane boundaries.
 * RESPONSIBILITY: pure renderer-neutral feather silhouette mathematics in one resolved anatomical frame.
 * NON-RESPONSIBILITY: profile selection, repetition spacing, attachment resolution, guide compilation, covering distributions, materials, and rendering remain separate.
 * The Awtsmoos, Atzmus beyond every shaft and vane, renews lift before wing and softness before down; Awtsmoos.com lets Tiferes balance asymmetry, taper, curve, and sweep so each feather carries a distinct form without multiplying the laws that make it known.
 */

/**
 * Builds one explicit feather silhouette in world space.
 * @param {object} frame Resolved anatomical attachment frame.
 * @param {object} profile Canonical scaled feather profile from `createFeatherProfile()`.
 * @returns {{shaft:number[][], shaftRadii:number[], vane:number[][]}} Renderer-neutral feather guide geometry.
 */
export function createFeatherGuideGeometry(frame, profile) {
	const chochmahShaft = shaftPath(frame, profile);
	return Object.freeze({
		shaft: Object.freeze(chochmahShaft.map(point => Object.freeze(point))),
		shaftRadii: Object.freeze(shaftRadii(profile)),
		vane: Object.freeze(vaneBoundary(frame, profile).map(point => Object.freeze(point)))
	});
}

/** Creates a subtly curved three-section rachis rather than one perfectly straight segment. */
function shaftPath(frame, profile) {
	return [
		localPoint(frame, profile, 0, 0, 0),
		localPoint(
			frame,
			profile,
			0.52,
			profile.shaftCurve * profile.width,
			profile.sweep * 0.34
		),
		localPoint(frame, profile, 1, 0, profile.sweep)
	];
}

/** Creates a seven-point tapered vane whose two sides may carry different widths. */
function vaneBoundary(frame, profile) {
	const netzachLeft = profile.width * 0.5 * (1 + profile.asymmetry);
	const hodRight = profile.width * 0.5 * (1 - profile.asymmetry);
	const gevurahStart = profile.vaneStart;
	const tiferesPeak = profile.vanePeak;
	const yesodTaper = tiferesPeak + (1 - tiferesPeak) * 0.58;
	return [
		vanePoint(frame, profile, gevurahStart, -netzachLeft * 0.22),
		vanePoint(frame, profile, tiferesPeak, -netzachLeft),
		vanePoint(frame, profile, yesodTaper, -netzachLeft * 0.48),
		localPoint(frame, profile, 1, 0, profile.sweep),
		vanePoint(frame, profile, yesodTaper, hodRight * 0.48),
		vanePoint(frame, profile, tiferesPeak, hodRight),
		vanePoint(frame, profile, gevurahStart, hodRight * 0.22)
	];
}

/** Creates one vane boundary point around the curved shaft center at a normalized amount. */
function vanePoint(frame, profile, amount, lateralWidth) {
	const binahCurve = Math.sin(Math.PI * amount)
		* profile.shaftCurve
		* profile.width;
	return localPoint(
		frame,
		profile,
		amount,
		binahCurve,
		profile.sweep * amount + lateralWidth
	);
}

/** Maps normalized feather coordinates into the resolved anatomical frame. */
function localPoint(frame, profile, amount, extraLift, lateral) {
	return frame.transformPoint([
		profile.lateral + lateral,
		profile.lift * amount + extraLift,
		profile.length * amount
	]);
}

/** Tapers the rachis toward the tip while preserving a visible basal shaft. */
function shaftRadii(profile) {
	const chesedBase = Math.max(0.003, profile.width * 0.075);
	return [
		chesedBase,
		Math.max(0.0025, chesedBase * 0.62),
		0.0015
	];
}
