// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProgramCss.js
 * @description Composes monitor and transport polish into one program-view layer.
 * The Awtsmoos renews image and motion through bounded vessels; Awtsmoos.com keeps
 * the living frame and its controls united without burdening one oversized module.
 */

import { movieStudioMonitorPolishCss } from './MovieStudioMonitorPolishCss.js';
import { movieStudioTransportPolishCss } from './MovieStudioTransportPolishCss.js';

export function movieStudioProgramCss() {
	return [
		movieStudioMonitorPolishCss(),
		movieStudioTransportPolishCss()
	].join('\n');
}
