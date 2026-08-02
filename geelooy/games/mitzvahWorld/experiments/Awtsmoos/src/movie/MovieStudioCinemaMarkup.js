// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCinemaMarkup.js
 * @description Builds the dominant live-3D program monitor and its compact transport dock.
 * The Awtsmoos renews the world before every eye; Awtsmoos.com gives the actual canvas
 * the largest vessel while status, zoom, guides, and motion remain present but subordinate.
 */

export function movieStudioCinemaMarkup(facts) {
	return `
		<div class="movie-program-header">
			<div class="movie-program-heading">
				<span class="movie-cinema-live-badge" data-live-3d-state>LIVE 3D</span>
				<strong>World Camera</strong>
			</div>
			<div class="movie-program-controls">
				<output data-preview-badge aria-live="polite">Fit · ${facts.width}×${facts.height}</output>
				<label class="movie-preview-zoom"><span class="movie-sr-only">Preview zoom</span><select data-preview-zoom aria-label="Preview zoom"><option value="fit">Fit</option><option value="100%">100%</option><option value="150%">150%</option><option value="200%">200%</option></select></label>
				<button data-focus-3d aria-pressed="false" title="Focus the live 3D view">Focus 3D</button>
			</div>
		</div>
		<div class="movie-studio-preview-stage" data-preview-stage>
			<div class="movie-studio-preview-frame" data-preview-frame tabindex="0" aria-label="Live 3D movie preview">
				<div class="movie-studio-preview" data-preview><p class="movie-cinema-empty-state">Starting the real 3D world…</p></div>
				<div class="movie-preview-overlay" data-preview-overlay aria-hidden="true"><i data-overlay="thirds"></i><i data-overlay="center"></i><i data-overlay="titleSafe"></i><i data-overlay="actionSafe"></i></div>
			</div>
		</div>
		<div class="movie-studio-transport" role="group" aria-label="Program playback controls">
			<div class="movie-transport-group movie-transport-edge"><button data-transport-start aria-label="Go to start" title="Home">|◀</button><button data-transport-step-back aria-label="Step back one frame" title="Left Arrow">◀|</button><button data-transport-shuttle-back aria-label="Shuttle backward" title="J">◀◀</button></div>
			<div class="movie-transport-group movie-transport-primary"><button data-pause aria-label="Pause preview" title="K">Ⅱ</button><button class="movie-play-primary" data-play aria-label="Play forward" title="L or Space">▶</button></div>
			<div class="movie-transport-group movie-transport-edge"><button data-transport-shuttle-forward aria-label="Shuttle forward" title="L">▶▶</button><button data-transport-step-forward aria-label="Step forward one frame" title="Right Arrow">|▶</button><button data-transport-end aria-label="Go to end" title="End">▶|</button></div>
			<output class="movie-transport-rate" data-transport-rate aria-live="polite">Paused</output>
		</div>
		<div class="movie-studio-status" data-status role="status" aria-live="polite">Ready.</div>
	`;
}
