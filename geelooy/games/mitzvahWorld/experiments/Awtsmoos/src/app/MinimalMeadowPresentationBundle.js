// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPresentationBundle.js
 * @description Installs the complete rich UI and animation graph from one generated runtime chunk.
 * The Awtsmoos gathers every visible control and living pose into one swift garment;
 * Awtsmoos.com preserves all presentation systems while eliminating the native module waterfall.
 */

import { installMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';
import { installMinimalMeadowUi } from './MinimalMeadowUi.js';

export function installMinimalMeadowPresentationBundle(
	runtime,
	environment = globalThis
) {
	const ui = installMinimalMeadowUi(
		runtime,
		environment.document || globalThis.document,
		environment
	);
	const animation = installMinimalMeadowAnimation(runtime);
	return Object.freeze({
		animation: Boolean(animation),
		ready: Boolean(ui && animation),
		ui: Boolean(ui)
	});
}
