// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInspectorMarkup.js
 * @description Defines transform, camera/action, keyframe, audio, 3D, project, appearance, and mobile controls.
 * The Awtsmoos renews detail without separating it from the whole; Awtsmoos.com gives
 * desktop side pane and mobile sheet one semantic inspector whose controls stay named and bounded.
 */

import { movieStudioAuthoring3dMarkup } from './MovieStudioAuthoring3dMarkup.js';
import { movieStudioAudioMixerMarkup } from './MovieStudioAudioMixerMarkup.js';
import { movieStudioCameraActionMarkup } from './MovieStudioCameraActionMarkup.js';
import { movieStudioKeyframeMarkup } from './MovieStudioKeyframeMarkup.js';

export function movieStudioInspectorMarkup() {
	return `
		<aside class="movie-studio-inspector" id="movie-studio-inspector" data-inspector aria-label="Movie inspector">
			<header class="movie-inspector-heading">
				<strong>Inspector</strong>
				<button data-inspector-close aria-label="Close inspector">×</button>
			</header>
			<div class="movie-inspector-body">
				<div data-transform></div>
				${movieStudioCameraActionMarkup()}
				${movieStudioKeyframeMarkup()}
				${movieStudioAudioMixerMarkup()}
				${movieStudioAuthoring3dMarkup()}
				${movieProjectJsonMarkup()}
				${movieAppearanceMarkup()}
			</div>
		</aside>
	`;
}

function movieProjectJsonMarkup() {
	return `
		<div class="movie-project-json-panel">
			<label for="movie-project-json">Project JSON</label>
			<textarea id="movie-project-json" data-project-json spellcheck="false"></textarea>
			<div class="movie-project-json-actions">
				<button data-apply-json>Apply JSON</button>
				<button data-render>Render</button>
				<button data-render-exact>Render Exact</button>
				<button data-copy-url>Copy URL</button>
			</div>
		</div>
	`;
}

function movieAppearanceMarkup() {
	return `
		<section class="movie-appearance-panel" aria-label="Editor appearance">
			<header class="movie-appearance-heading"><h3>Appearance</h3><output data-preview-badge aria-live="polite">Fit preview</output></header>
			<label>Theme<select data-theme><option value="awtsmoos-dark">Awtsmoos Dark</option><option value="neutral-dark">Neutral Dark</option><option value="light">Light</option><option value="high-contrast">High Contrast</option></select></label>
			<label>Density<select data-density><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="touch">Touch</option></select></label>
			<label>Preview<select data-preview-zoom><option value="fit">Fit</option><option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option></select></label>
			<div class="movie-overlay-options" data-overlay-options>
				<label><input type="checkbox" data-overlay-toggle="thirds"> Thirds</label>
				<label><input type="checkbox" data-overlay-toggle="center"> Center</label>
				<label><input type="checkbox" data-overlay-toggle="titleSafe"> Title safe</label>
				<label><input type="checkbox" data-overlay-toggle="actionSafe"> Action safe</label>
			</div>
			<button data-reset-preferences>Reset appearance</button>
		</section>
	`;
}
