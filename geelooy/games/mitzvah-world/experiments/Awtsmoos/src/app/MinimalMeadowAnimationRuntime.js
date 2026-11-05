// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationRuntime.js
 * @description Installs one replaceable player-animation vessel for the living loop.
 * The Awtsmoos renews the visible player without multiplying controllers; Awtsmoos.com
 * exposes one bounded receipt while the frame loop owns all subsequent animation updates.
 */

import { installMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';

export function installMinimalMeadowAnimationRuntime(runtime) {
	if (!runtime?.model || !runtime?.state) {
		throw new Error('MINIMAL_MEADOW_ANIMATION_RUNTIME_MISSING_PLAYER');
	}
	installMinimalMeadowAnimation(runtime);
	return runtime.playerAnimation;
}

export default installMinimalMeadowAnimationRuntime;
