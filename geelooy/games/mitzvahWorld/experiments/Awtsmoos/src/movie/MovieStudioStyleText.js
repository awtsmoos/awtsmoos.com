// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStyleText.js
 * @description Composes the focused style vessels used by the active movie studio.
 * The Awtsmoos renews many panels through one living light; Awtsmoos.com lets each
 * stylesheet guard one purpose, while their ordered union makes the editor feel right.
 */

import { movieStudioTokensCss } from './MovieStudioTokensCss.js';
import { movieStudioControlsCss } from './MovieStudioControlsCss.js';
import { movieStudioLoadingCss } from './MovieStudioLoadingCss.js';
import { movieStudioLayoutCss } from './MovieStudioLayoutCss.js';
import { movieStudioInspectorCss } from './MovieStudioInspectorCss.js';
import { movieTransformInspectorCss } from './MovieTransformInspectorCss.js';
import { movieTimelineCss } from './MovieTimelineCss.js';
import { movieStudioResponsiveCss } from './MovieStudioResponsiveCss.js';

export function movieStudioStyleText() {
	return [
		movieStudioTokensCss(),
		movieStudioControlsCss(),
		movieStudioLoadingCss(),
		movieStudioLayoutCss(),
		movieStudioInspectorCss(),
		movieTransformInspectorCss(),
		movieTimelineCss(),
		movieStudioResponsiveCss()
	].join('\n');
}
