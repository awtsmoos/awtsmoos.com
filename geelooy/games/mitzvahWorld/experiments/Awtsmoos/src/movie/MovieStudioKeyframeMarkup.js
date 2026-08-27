// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioKeyframeMarkup.js
 * @description Defines a selected-clip visual effect-keyframe editor with property lanes and diamonds.
 * The Awtsmoos renews value, time, and easing before the hand meets the lane; Awtsmoos.com
 * gives desktop and mobile one accessible path for adding, updating, selecting, and removing keyframes.
 */

export function movieStudioKeyframeMarkup() {
	return `
		<section class="movie-keyframe-panel" data-keyframe-panel aria-labelledby="movie-keyframe-title">
			<header class="movie-keyframe-heading">
				<h3 id="movie-keyframe-title">Effect Keyframes</h3>
				<output data-keyframe-status aria-live="polite">Select a clip.</output>
			</header>
			<output class="movie-keyframe-selection" data-keyframe-selection>No selected clip</output>
			<div class="movie-keyframe-controls">
				<label>Property<select data-keyframe-kind><option value="opacity">Opacity</option><option value="brightness">Brightness</option><option value="contrast">Contrast</option><option value="saturate">Saturation</option><option value="blur">Blur</option></select></label>
				<label>Base value<input data-keyframe-base-value type="number" step="0.01" value="1"></label>
				<label>Time<input data-keyframe-time type="number" min="0" step="0.01" value="0"></label>
				<label>Value<input data-keyframe-value type="number" step="0.01" value="1"></label>
				<label>Easing<select data-keyframe-easing><option>linear</option><option>easeInQuad</option><option>easeOutQuad</option><option>easeInOutQuad</option><option>easeInOutCubic</option><option>smoothstep</option><option>smootherstep</option></select></label>
			</div>
			<div class="movie-keyframe-actions">
				<button data-keyframe-add>Add or update diamond</button>
				<button data-keyframe-remove>Remove selected diamond</button>
			</div>
			<div class="movie-keyframe-lanes" data-keyframe-lanes aria-label="Effect keyframe lanes"></div>
		</section>
	`;
}
