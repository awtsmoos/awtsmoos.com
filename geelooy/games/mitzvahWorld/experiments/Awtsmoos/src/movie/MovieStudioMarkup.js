// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMarkup.js
 * @description Holds the semantic structure of the active MitzvahWorld editor shell.
 * The Awtsmoos renews each control from one indivisible source; Awtsmoos.com gives
 * every visible region a truthful name, so keyboard, touch, and sight can share its course.
 */

export function movieStudioMarkup() {
	return `
		<header class="movie-studio-bar">
			<div class="movie-studio-brand">
				<strong data-title>Movie Maker</strong>
				<span data-project-meta>Preparing project…</span>
			</div>
			<button data-inspector-toggle aria-controls="movie-studio-inspector" aria-expanded="true">
				<span aria-hidden="true">☰</span>
				<span class="movie-secondary-label">Inspector</span>
			</button>
		</header>
		<div class="movie-studio-workspace">
			<main class="movie-studio-preview-column">
				<div class="movie-studio-preview-shell">
					<div class="movie-studio-preview" data-preview aria-label="Movie preview"></div>
				</div>
				<div class="movie-studio-transport" aria-label="Playback controls">
					<button data-play title="Play preview (Space)">
						▶ <span class="movie-secondary-label">Play</span>
					</button>
					<button data-stop title="Pause preview (Space)">
						■ <span class="movie-secondary-label">Pause</span>
					</button>
				</div>
				<div class="movie-studio-status" data-status role="status" aria-live="polite">Ready.</div>
			</main>
			<aside class="movie-studio-inspector" id="movie-studio-inspector" data-inspector>
				<header class="movie-studio-inspector-header">
					<h2>Inspector</h2>
					<button data-inspector-close aria-label="Close inspector">×</button>
				</header>
				<section class="movie-studio-section">
					<h3>Project</h3>
					<div class="movie-studio-project-summary">
						<div class="movie-studio-summary-item">
							<span>Canvas</span><strong data-resolution></strong>
						</div>
						<div class="movie-studio-summary-item">
							<span>Frame rate</span><strong data-fps></strong>
						</div>
						<div class="movie-studio-summary-item">
							<span>Duration</span><strong data-duration></strong>
						</div>
						<div class="movie-studio-summary-item">
							<span>Tracks</span><strong data-track-count></strong>
						</div>
					</div>
				</section>
				<section class="movie-studio-section" data-transform></section>
				<section class="movie-studio-section">
					<h3>Project and export</h3>
					<div class="movie-studio-actions">
						<button class="movie-primary-action" data-render>Render Live MP4</button>
						<button data-render-exact>Render Exact Package</button>
						<button data-copy>Copy Project URL</button>
					</div>
				</section>
				<details class="movie-studio-section">
					<summary>Advanced project JSON</summary>
					<label class="movie-studio-field">
						<span>Canonical project document</span>
						<textarea class="movie-studio-json" spellcheck="false" data-json></textarea>
					</label>
					<button data-apply>Apply JSON</button>
				</details>
			</aside>
		</div>
		<div data-timeline aria-label="Movie timeline"></div>
	`;
}
