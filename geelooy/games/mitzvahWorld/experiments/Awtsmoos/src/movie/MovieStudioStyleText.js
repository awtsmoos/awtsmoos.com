// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStyleText.js
 * @description Composes every NLE contract with cinema-first, API-parity, adaptive, and inclusive polish.
 * The Awtsmoos renews panel, monitor, timeline, method mirror, touch sheet, and accessible path in one light;
 * Awtsmoos.com joins each bounded vessel while the living 3D frame receives first revelation.
 */

import { movieStudioAccessibilityCss } from './MovieStudioAccessibilityCss.js';
import { movieStudioAdaptiveCss } from './MovieStudioAdaptiveCss.js';
import { movieStudioApiExplorerCss } from './MovieStudioApiExplorerCss.js';
import { movieStudioAuthoring3dCss } from './MovieStudioAuthoring3dCss.js';
import { movieStudioAudioMixerCss } from './MovieStudioAudioMixerCss.js';
import { movieStudioCameraActionCss } from './MovieStudioCameraActionCss.js';
import { movieStudioCinemaCss } from './MovieStudioCinemaCss.js';
import { movieStudioCompositionCss } from './MovieStudioCompositionCss.js';
import { movieStudioControlsCss } from './MovieStudioControlsCss.js';
import { localizeMovieStudioCss } from './MovieStudioCssLocalizer.js';
import { movieStudioDensityCss } from './MovieStudioDensityCss.js';
import { movieStudioInclusiveCss } from './MovieStudioInclusiveCss.js';
import { movieStudioInspectorCss } from './MovieStudioInspectorCss.js';
import { movieStudioKeyframeCss } from './MovieStudioKeyframeCss.js';
import { movieStudioLayoutCss } from './MovieStudioLayoutCss.js';
import { movieStudioLoadingCss } from './MovieStudioLoadingCss.js';
import { MOVIE_STUDIO_PERFORMANCE_CSS } from './MovieStudioPerformanceCss.js';
import { movieStudioPerformanceOverlayCss } from './MovieStudioPerformanceOverlayCss.js';
import { movieStudioPreviewCss } from './MovieStudioPreviewCss.js';
import { movieStudioProfessionalCss } from './MovieStudioProfessionalCss.js';
import { movieStudioProgramCss } from './MovieStudioProgramCss.js';
import { movieStudioProjectBrowserCss } from './MovieStudioProjectBrowserCss.js';
import { movieStudioResponsiveCss } from './MovieStudioResponsiveCss.js';
import { movieStudioSantoCss } from './MovieStudioSantoCss.js';
import { movieStudioScene3dCss } from './MovieStudioScene3dCss.js';
import { movieStudioSplitterCss } from './MovieStudioSplitterCss.js';
import { movieStudioStatusBarCss } from './MovieStudioStatusBarCss.js';
import { movieStudioThemeCss } from './MovieStudioThemeCss.js';
import { movieStudioTitleCss } from './MovieStudioTitleCss.js';
import { movieStudioTokensCss } from './MovieStudioTokensCss.js';
import { movieStudioTransportCss } from './MovieStudioTransportCss.js';
import { movieStudioUtilityContentCss } from './MovieStudioUtilityContentCss.js';
import { movieStudioUtilityCss } from './MovieStudioUtilityCss.js';
import { movieStudioUtilityResponsiveCss } from './MovieStudioUtilityResponsiveCss.js';
import { movieTimelineAppearanceCss } from './MovieTimelineAppearanceCss.js';
import { movieTimelineCss } from './MovieTimelineCss.js';
import { movieTimelineProfessionalCss } from './MovieTimelineProfessionalCss.js';

export function movieStudioStyleText() {
	const fragments = [
		movieStudioLoadingCss(),
		movieStudioTokensCss(),
		movieStudioThemeCss(),
		movieStudioSantoCss(),
		movieStudioLayoutCss(),
		movieStudioControlsCss(),
		movieStudioPreviewCss(),
		movieStudioTransportCss(),
		movieStudioInspectorCss(),
		movieStudioCompositionCss(),
		MOVIE_STUDIO_PERFORMANCE_CSS,
		movieStudioPerformanceOverlayCss(),
		movieStudioScene3dCss(),
		movieStudioCameraActionCss(),
		movieStudioKeyframeCss(),
		movieStudioAudioMixerCss(),
		movieStudioTitleCss(),
		movieStudioAuthoring3dCss(),
		movieTimelineCss(),
		movieTimelineAppearanceCss(),
		movieStudioSplitterCss(),
		movieStudioStatusBarCss(),
		movieStudioUtilityCss(),
		movieStudioUtilityContentCss(),
		movieStudioApiExplorerCss(),
		movieStudioProjectBrowserCss(),
		movieStudioDensityCss(),
		movieStudioResponsiveCss(),
		movieStudioUtilityResponsiveCss(),
		movieStudioAccessibilityCss(),
		movieStudioProfessionalCss(),
		movieStudioProgramCss(),
		movieTimelineProfessionalCss(),
		movieStudioAdaptiveCss(),
		movieStudioInclusiveCss(),
		movieStudioCinemaCss()
	];
	return localizeMovieStudioCss(fragments.join('\n'));
}
