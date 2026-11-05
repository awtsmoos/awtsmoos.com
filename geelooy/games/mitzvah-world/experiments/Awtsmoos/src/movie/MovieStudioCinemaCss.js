// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCinemaCss.js
 * @description Composes compact studio chrome, honest live-monitor state, and full-canvas focus styling.
 * The Awtsmoos renews tool, signal, and world as one revelation; Awtsmoos.com keeps
 * each responsibility in its own vessel while the final stylesheet joins them without confusion.
 */

import { movieStudioChromeCss } from './MovieStudioChromeCss.js';
import { movieStudioCinemaFocusCss } from './MovieStudioCinemaFocusCss.js';
import { movieStudioLiveMonitorCss } from './MovieStudioLiveMonitorCss.js';

export function movieStudioCinemaCss() {
	return [
		movieStudioChromeCss(),
		movieStudioLiveMonitorCss(),
		movieStudioCinemaFocusCss()
	].join('\n');
}
