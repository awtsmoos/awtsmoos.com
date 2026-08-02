// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInspectorMarkup.js
 * @description Composes transform, performance, scene, camera, keyframe, audio, title, composition, 3D, and project controls.
 * The Awtsmoos renews each finite inspector vessel through one source; Awtsmoos.com keeps
 * acting, scene editing, nested canvases, authoring, media, titles, sound, and project history coherent.
 */

import { movieStudioAudioMixerMarkup } from './MovieStudioAudioMixerMarkup.js';
import { movieStudioAuthoring3dMarkup } from './MovieStudioAuthoring3dMarkup.js';
import { movieStudioCameraActionMarkup } from './MovieStudioCameraActionMarkup.js';
import { movieStudioCompositionMarkup } from './MovieStudioCompositionMarkup.js';
import { movieStudioKeyframeMarkup } from './MovieStudioKeyframeMarkup.js';
import { movieStudioPerformanceInspectorMarkup } from './MovieStudioPerformanceMarkup.js';
import { movieStudioProjectBrowserMarkup } from './MovieStudioProjectBrowserMarkup.js';
import { movieStudioScene3dMarkup } from './MovieStudioScene3dMarkup.js';
import { movieStudioTitleMarkup } from './MovieStudioTitleMarkup.js';

export function movieStudioInspectorMarkup() {
	return `
		<aside id="movie-studio-inspector" class="movie-studio-inspector" data-inspector aria-label="Movie inspector">
			<div class="movie-inspector-heading"><strong>Inspector</strong><button data-inspector-close aria-label="Close inspector">×</button></div>
			<div class="movie-inspector-body">
				<p data-selection>No selection</p>
				<section data-transform data-transform-fields aria-label="Transform inspector"></section>
				${movieStudioPerformanceInspectorMarkup()}
				${movieStudioScene3dMarkup()}
				${movieStudioCameraActionMarkup()}
				${movieStudioKeyframeMarkup()}
				${movieStudioAudioMixerMarkup()}
				${movieStudioTitleMarkup()}
				${movieStudioCompositionMarkup()}
				${movieStudioAuthoring3dMarkup()}
				${movieStudioProjectBrowserMarkup()}
				${appearanceMarkup()}
				${projectJsonMarkup()}
			</div>
		</aside>
	`;
}

function appearanceMarkup() {
	return `
		<section class="movie-appearance-panel" data-appearance-panel><div class="movie-appearance-heading"><h3>Clip Appearance</h3><output data-appearance-selection>No visual clip selected</output></div>
			<label>Opacity <input type="range" min="0" max="1" step="0.01" value="1" data-appearance-opacity></label>
			<label>Filter <select data-appearance-filter><option value="none">None</option><option value="grayscale(1)">Grayscale</option><option value="sepia(1)">Sepia</option><option value="contrast(1.35)">High contrast</option><option value="saturate(1.5)">Saturated</option></select></label>
			<div class="movie-overlay-options"><label><input type="checkbox" data-overlay-option="thirds"> Rule of thirds</label><label><input type="checkbox" data-overlay-option="center"> Center crosshair</label><label><input type="checkbox" data-overlay-option="titleSafe"> Title safe</label><label><input type="checkbox" data-overlay-option="actionSafe"> Action safe</label></div>
		</section>`;
}

function projectJsonMarkup() {
	return `
		<section class="movie-project-json-panel" aria-label="Project JSON"><textarea data-project-json aria-label="Movie project JSON"></textarea>
			<div class="movie-project-json-actions"><button data-project-copy>Copy JSON</button><button data-project-apply>Apply JSON</button></div>
		</section>`;
}
