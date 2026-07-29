// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStyleText.js
 * @description Composes localized recovery, editor, camera, keyframe, audio, title, 3D, timeline, and responsive CSS.
 * The Awtsmoos renews every pane, save, lens, waveform, word, diamond, effect, and guide inside protected light;
 * Awtsmoos.com prevents neighboring pages and sibling studios from inheriting another vessel's sight.
 */

import { movieStudioAccessibilityCss } from './MovieStudioAccessibilityCss.js';
import { movieStudioAuthoring3dCss } from './MovieStudioAuthoring3dCss.js';
import { movieStudioAudioMixerCss } from './MovieStudioAudioMixerCss.js';
import { movieStudioCameraActionCss } from './MovieStudioCameraActionCss.js';
import { movieStudioControlsCss } from './MovieStudioControlsCss.js';
import { localizeMovieStudioCss } from './MovieStudioCssLocalizer.js';
import { movieStudioDensityCss } from './MovieStudioDensityCss.js';
import { movieStudioInspectorCss } from './MovieStudioInspectorCss.js';
import { movieStudioKeyframeCss } from './MovieStudioKeyframeCss.js';
import { movieStudioLayoutCss } from './MovieStudioLayoutCss.js';
import { movieStudioLoadingCss } from './MovieStudioLoadingCss.js';
import { movieStudioPreviewCss } from './MovieStudioPreviewCss.js';
import { movieStudioProjectBrowserCss } from './MovieStudioProjectBrowserCss.js';
import { movieStudioResponsiveCss } from './MovieStudioResponsiveCss.js';
import { movieStudioSantoCss } from './MovieStudioSantoCss.js';
import { movieStudioSplitterCss } from './MovieStudioSplitterCss.js';
import { movieStudioStatusBarCss } from './MovieStudioStatusBarCss.js';
import { movieStudioThemeCss } from './MovieStudioThemeCss.js';
import { movieStudioTitleCss } from './MovieStudioTitleCss.js';
import { movieStudioTokensCss } from './MovieStudioTokensCss.js';
import { movieStudioUtilityContentCss } from './MovieStudioUtilityContentCss.js';
import { movieStudioUtilityCss } from './MovieStudioUtilityCss.js';
import { movieStudioUtilityResponsiveCss } from './MovieStudioUtilityResponsiveCss.js';
import { movieTimelineAppearanceCss } from './MovieTimelineAppearanceCss.js';
import { movieTimelineCss } from './MovieTimelineCss.js';

export function movieStudioStyleText() {
	const fragments = [
		movieStudioLoadingCss(), movieStudioTokensCss(), movieStudioThemeCss(),
		movieStudioSantoCss(), movieStudioLayoutCss(), movieStudioControlsCss(),
		movieStudioPreviewCss(), movieStudioInspectorCss(), movieStudioCameraActionCss(),
		movieStudioKeyframeCss(), movieStudioAudioMixerCss(), movieStudioTitleCss(),
		movieStudioAuthoring3dCss(), movieTimelineCss(), movieTimelineAppearanceCss(),
		movieStudioSplitterCss(), movieStudioStatusBarCss(), movieStudioUtilityCss(),
		movieStudioUtilityContentCss(), movieStudioProjectBrowserCss(), movieStudioDensityCss(),
		movieStudioResponsiveCss(), movieStudioUtilityResponsiveCss(), movieStudioAccessibilityCss()
	];
	return localizeMovieStudioCss(fragments.join('\n'));
}
