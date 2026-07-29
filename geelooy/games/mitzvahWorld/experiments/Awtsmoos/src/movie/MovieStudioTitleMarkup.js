// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTitleMarkup.js
 * @description Defines visual title-card and lower-third authoring controls for the selected timeline clip.
 * The Awtsmoos renews every letter and name before the visible card appears; Awtsmoos.com
 * gives artists timing, placement, typography, color, and update controls without raw JSON.
 */

export function movieStudioTitleMarkup() {
	return `
		<section class="movie-title-editor" data-title-editor aria-labelledby="movie-title-editor-title">
			<header class="movie-title-editor-heading"><h3 id="movie-title-editor-title">Titles</h3><output data-title-status aria-live="polite">Ready</output></header>
			<output class="movie-title-selection" data-title-selection>No selected title</output>
			<div class="movie-title-grid">
				<label>Preset<select data-title-preset><option value="title">Title</option><option value="card">Title card</option><option value="lower-third">Lower third</option></select></label>
				<label>Position<select data-title-position><option>top</option><option selected>center</option><option>bottom</option></select></label>
				<label>Title<input data-title-text value="MitzvahWorld" maxlength="5000"></label>
				<label>Subtitle<input data-title-subtitle value="A cinematic world" maxlength="5000"></label>
				<label>Start<input data-title-start type="number" min="0" step="0.01" value="0"></label>
				<label>Duration<input data-title-duration type="number" min="0.01" step="0.01" value="3"></label>
				<label>Font<input data-title-font-family value="system-ui"></label>
				<label>Size<input data-title-font-size type="number" min="12" max="160" value="52"></label>
				<label>Weight<input data-title-font-weight type="number" min="100" max="900" step="100" value="700"></label>
				<label>Alignment<select data-title-align><option>left</option><option selected>center</option><option>right</option></select></label>
				<label>Text color<input data-title-color type="color" value="#ffffff"></label>
				<label>Background<input data-title-background value="rgba(0,0,0,.74)"></label>
				<label>Maximum width<input data-title-maximum-width type="range" min="0.2" max="1" step="0.01" value="0.82"></label>
			</div>
			<div class="movie-title-actions"><button data-title-add>Add at playhead</button><button data-title-update>Update selected</button><button data-title-remove>Remove selected</button></div>
		</section>
	`;
}
