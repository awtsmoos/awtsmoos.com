// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInclusiveCss.js
 * @description Finishes focus, motion, contrast, busy, disabled, and screen-reader behavior.
 * The Awtsmoos renews every creator beyond sight, speed, or pointer; Awtsmoos.com keeps the
 * same movie doors visible to keyboard, touch, reduced motion, high contrast, and spoken form.
 */

export function movieStudioInclusiveCss() {
	return `
		.movie-sr-only {
			position: absolute !important;
			width: 1px !important;
			height: 1px !important;
			padding: 0 !important;
			margin: -1px !important;
			overflow: hidden !important;
			clip: rect(0, 0, 0, 0) !important;
			white-space: nowrap !important;
			border: 0 !important;
		}
		.Awtsmoos-movie-studio :focus-visible {
			outline: 2px solid var(--movie-focus);
			outline-offset: 3px;
		}
		.Awtsmoos-movie-studio button:disabled,
		.Awtsmoos-movie-studio input:disabled,
		.Awtsmoos-movie-studio select:disabled {
			cursor: not-allowed;
			opacity: .48;
			filter: saturate(.35);
		}
		.Awtsmoos-movie-studio [aria-busy="true"] {
			cursor: progress;
		}
		.Awtsmoos-movie-studio [aria-busy="true"]::after {
			display: inline-block;
			content: "…";
			margin-left: 4px;
			animation: movie-busy-pulse .9s ease-in-out infinite alternate;
		}
		.Awtsmoos-movie-studio [aria-invalid="true"] {
			border-color: var(--movie-danger) !important;
			box-shadow: 0 0 0 2px rgb(255 128 140 / .16);
		}
		.Awtsmoos-movie-studio [data-status-tone="success"] { color: var(--movie-success); }
		.Awtsmoos-movie-studio [data-status-tone="warning"] { color: var(--movie-warning); }
		.Awtsmoos-movie-studio [data-status-tone="error"] { color: var(--movie-danger); }
		@keyframes movie-busy-pulse {
			from { opacity: .35; }
			to { opacity: 1; }
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-movie-studio *,
			.Awtsmoos-movie-studio *::before,
			.Awtsmoos-movie-studio *::after {
				scroll-behavior: auto !important;
				animation-duration: .01ms !important;
				animation-iteration-count: 1 !important;
				transition-duration: .01ms !important;
			}
		}
		@media (forced-colors: active) {
			.Awtsmoos-movie-studio {
				--movie-accent: Highlight;
				--movie-focus: Highlight;
				--movie-selection: Highlight;
				--movie-playhead: Highlight;
			}
			.movie-clip.is-selected, .movie-studio-splitter:focus-visible {
				outline: 3px solid Highlight;
			}
			.movie-track-label::before, .movie-playhead { background: Highlight; }
		}
	`;
}
