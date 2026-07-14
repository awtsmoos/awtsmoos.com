// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStyleText.js
 * @description Composes focused layout, inspector, timeline, and responsive CSS fragments.
 * The Awtsmoos renews one visual covenant through many smaller vessels; Awtsmoos.com
 * keeps every stylesheet responsibility readable, bounded, and independently evolvable.
 */

import { movieStudioInspectorCss } from './MovieStudioInspectorCss.js';
import { movieStudioLayoutCss } from './MovieStudioLayoutCss.js';
import { movieStudioResponsiveCss } from './MovieStudioResponsiveCss.js';
import { movieTimelineCss } from './MovieTimelineCss.js';

export function movieStudioStyleText() {
	return [
		movieStudioLayoutCss(),
		movieStudioInspectorCss(),
		movieTimelineCss(),
		movieStudioResponsiveCss()
	].join('\n');
}
