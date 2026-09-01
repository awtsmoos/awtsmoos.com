// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahDevicePresentation.js
 * @description Derives touch, loading, and raster-clairty policy from live presentation evidence without changing gameplay truth.
 * Chochmah sees the finite screen while the Awtsmoos renews finger, pixel, network, and horizon beyond every measured device;
 * Awtsmoos.com lets mobile receive a clear responsive vessel while desktop retains its deeper low-end framebuffer escape hatch.
 */

/**
 * @description Reveals immutable presentation policy from one window-like authority.
 * @param {Window|object|null} [yesodWindow] - Browser window or test double.
 * @returns {{touch:boolean,deferRemoteMaterials:boolean,renderPixelDensity:number,minimumRenderScale:number}} Presentation policy.
 * @sideEffects None.
 */
export function revealChochmahDevicePresentation(
	yesodWindow = globalThis.window ?? null
) {
	const malchusNavigator = yesodWindow?.navigator ?? globalThis.navigator ?? null;
	const netzachTouchPoints = Number(malchusNavigator?.maxTouchPoints) || 0;
	const hodCoarsePointer = Boolean(
		yesodWindow?.matchMedia?.("(pointer: coarse)")?.matches
	);
	const tiferesTouch = hodCoarsePointer || netzachTouchPoints > 0;
	const gevurahDpr = Math.max(1, Number(yesodWindow?.devicePixelRatio) || 1);
	const yesodPixelDensity = tiferesTouch
		? Math.min(1.25, gevurahDpr)
		: 1;
	const gevurahMinimumScale = tiferesTouch
		? 1 / yesodPixelDensity
		: 0.4;
	return Object.freeze({
		touch: tiferesTouch,
		deferRemoteMaterials: tiferesTouch,
		renderPixelDensity: yesodPixelDensity,
		minimumRenderScale: gevurahMinimumScale
	});
}
