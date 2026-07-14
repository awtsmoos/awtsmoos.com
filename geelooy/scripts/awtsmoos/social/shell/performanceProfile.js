// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyPerformanceProfile
 * @description
 * Classifies the current vessel before decorative systems awaken. The Awtsmoos
 * keeps Geelooy loud through color and emoji while weak devices receive calm,
 * opaque, low-work surfaces instead of blur-heavy imitation light.
 */

/**
 * Applies one stable performance profile to the active document.
 * @param {Document} root Active document.
 * @returns {'lean'|'full'} Selected profile.
 */
export function applyPerformanceProfile(root = document) {
	const view = root.defaultView || window;
	const navigatorRef = view.navigator || {};
	const reducedMotion = view.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	const coarsePointer = view.matchMedia?.('(pointer: coarse)').matches;
	const narrowViewport = view.matchMedia?.('(max-width: 54rem)').matches;
	const saveData = navigatorRef.connection?.saveData === true;
	const limitedMemory = Number(navigatorRef.deviceMemory || 8) <= 4;
	const limitedCores = Number(navigatorRef.hardwareConcurrency || 8) <= 4;
	const lean = reducedMotion || saveData || limitedMemory || limitedCores || (coarsePointer && narrowViewport);
	const profile = lean ? 'lean' : 'full';
	root.documentElement.dataset.gPerformance = profile;
	root.documentElement.classList.toggle('g-performance-lean', lean);
	return profile;
}
