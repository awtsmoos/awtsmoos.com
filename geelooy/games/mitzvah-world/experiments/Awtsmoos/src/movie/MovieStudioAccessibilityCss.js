// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAccessibilityCss.js
 * @description Adapts focus, motion, contrast, forced colors, screen readers, and coarse-pointer targets safely.
 * The Awtsmoos renews every human vessel beyond assumption; Awtsmoos.com lets motion,
 * contrast, pointer, and system colors differ while focus and meaning remain unmistakable.
 */

export function movieStudioAccessibilityCss() {
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
			outline: 3px solid var(--movie-focus);
			outline-offset: 2px;
		}
		.Awtsmoos-movie-studio button:focus-visible,
		.Awtsmoos-movie-studio input:focus-visible,
		.Awtsmoos-movie-studio select:focus-visible {
			box-shadow: 0 0 0 2px var(--movie-surface);
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-movie-studio *,
			.Awtsmoos-movie-studio *::before,
			.Awtsmoos-movie-studio *::after {
				scroll-behavior: auto !important;
				transition-duration: 0.001ms !important;
				animation-duration: 0.001ms !important;
				animation-iteration-count: 1 !important;
			}
		}
		@media (prefers-contrast: more) {
			.Awtsmoos-movie-studio {
				--movie-border: var(--movie-border-strong);
				--movie-divider-subtle: var(--movie-divider-strong);
			}
			.movie-clip,
			.movie-studio-section,
			.movie-studio-inspector,
			.movie-studio-preview,
			.movie-utility-panel {
				border-width: 2px;
			}
		}
		@media (forced-colors: active) {
			.Awtsmoos-movie-studio {
				--movie-accent: Highlight;
				--movie-focus: Highlight;
				--movie-playhead: Highlight;
				forced-color-adjust: auto;
			}
			.movie-clip,
			.movie-marker,
			.movie-studio-splitter,
			.movie-track-header-splitter {
				forced-color-adjust: auto;
			}
			.movie-clip.is-selected {
				outline: 3px solid Highlight;
			}
		}
		@media (pointer: coarse) {
			.Awtsmoos-movie-studio {
				--movie-control-height: max(44px, var(--movie-control-height));
				--movie-touch-height: max(48px, var(--movie-touch-height));
				--movie-trim-width: max(18px, var(--movie-trim-width));
				--movie-splitter-size: 12px;
			}
			.movie-studio-splitter::after,
			.movie-track-header-splitter::after {
				inset: 2px;
			}
		}
	`;
}
