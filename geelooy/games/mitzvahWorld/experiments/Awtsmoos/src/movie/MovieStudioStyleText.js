// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStyleText.js
 * @description Composes and localizes every editor, camera, action, and 3D-authoring stylesheet beneath one root.
 * The Awtsmoos renews theme, node, lens, pane, timeline, and responsive gate in protected light;
 * Awtsmoos.com prevents neighboring pages and sibling studios from inheriting another vessel's sight.
 */

import { movieStudioAccessibilityCss } from './MovieStudioAccessibilityCss.js';
import { movieStudioAuthoring3dCss } from './MovieStudioAuthoring3dCss.js';
import { movieStudioCameraActionCss } from './MovieStudioCameraActionCss.js';
import { movieStudioControlsCss } from './MovieStudioControlsCss.js';
import { localizeMovieStudioCss } from './MovieStudioCssLocalizer.js';
import { movieStudioDensityCss } from './MovieStudioDensityCss.js';
import { movieStudioInspectorCss } from './MovieStudioInspectorCss.js';
import { movieStudioLayoutCss } from './MovieStudioLayoutCss.js';
import { movieStudioLoadingCss } from './MovieStudioLoadingCss.js';
import { movieStudioPreviewCss } from './MovieStudioPreviewCss.js';
import { movieStudioResponsiveCss } from './MovieStudioResponsiveCss.js';
import { movieStudioSantoCss } from './MovieStudioSantoCss.js';
import { movieStudioSplitterCss } from './MovieStudioSplitterCss.js';
import { movieStudioStatusBarCss } from './MovieStudioStatusBarCss.js';
import { movieStudioThemeCss } from './MovieStudioThemeCss.js';
import { movieStudioTokensCss } from './MovieStudioTokensCss.js';
import { movieStudioUtilityContentCss } from './MovieStudioUtilityContentCss.js';
import { movieStudioUtilityCss } from './MovieStudioUtilityCss.js';
import { movieStudioUtilityResponsiveCss } from './MovieStudioUtilityResponsiveCss.js';
import { movieTimelineCss } from './MovieTimelineCss.js';

export function movieStudioStyleText() {
	const fragments = [
		movieStudioLoadingCss(),
		movieStudioTokensCss(),
		movieStudioThemeCss(),
		movieStudioSantoCss(),
		movieStudioLayoutCss(),
		movieStudioControlsCss(),
		movieStudioPreviewCss(),
		movieStudioInspectorCss(),
		movieStudioCameraActionCss(),
		movieStudioAuthoring3dCss(),
		movieTimelineCss(),
		movieStudioSplitterCss(),
		movieStudioStatusBarCss(),
		movieStudioUtilityCss(),
		movieStudioUtilityContentCss(),
		movieStudioDensityCss(),
		movieStudioResponsiveCss(),
		movieStudioUtilityResponsiveCss(),
		movieStudioAccessibilityCss()
	];
	return localizeMovieStudioCss(fragments.join('\n'));
}
