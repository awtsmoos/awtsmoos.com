// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreferenceMarkup.js
 * @description Defines accessible density, theme, preview, overlay, and reset preference controls.
 * The Awtsmoos is beyond arrangement, shade, and scale; Awtsmoos.com gives each finite
 * artist a visible reversible vessel for comfort, focus, framing guides, and preview magnification.
 */

export function movieStudioPreferenceMarkup() {
	return `
		<section class="movie-preference-panel" data-preference-panel aria-labelledby="movie-preference-title">
			<header class="movie-preference-heading">
				<h3 id="movie-preference-title">Workspace Preferences</h3>
				<output data-preview-badge aria-live="polite">100% · Comfortable</output>
			</header>
			<div class="movie-preference-grid">
				<label>Density
					<select data-density>
						<option value="compact">Compact</option>
						<option value="comfortable">Comfortable</option>
						<option value="touch">Touch</option>
					</select>
				</label>
				<label>Theme
					<select data-theme>
						<option value="neutral-dark">Neutral dark</option>
						<option value="light">Light</option>
						<option value="high-contrast">High contrast</option>
					</select>
				</label>
				<label>Preview zoom
					<select data-preview-zoom>
						<option value="fit">Fit</option>
						<option value="50%">50%</option>
						<option value="100%">100%</option>
						<option value="150%">150%</option>
						<option value="200%">200%</option>
					</select>
				</label>
			</div>
			<fieldset class="movie-preference-overlays">
				<legend>Preview guides</legend>
				<label><input type="checkbox" data-overlay-toggle="thirds"> Rule of thirds</label>
				<label><input type="checkbox" data-overlay-toggle="center"> Center crosshair</label>
				<label><input type="checkbox" data-overlay-toggle="titleSafe"> Title safe</label>
				<label><input type="checkbox" data-overlay-toggle="actionSafe"> Action safe</label>
			</fieldset>
			<button data-reset-preferences type="button">Reset workspace preferences</button>
		</section>
	`;
}
