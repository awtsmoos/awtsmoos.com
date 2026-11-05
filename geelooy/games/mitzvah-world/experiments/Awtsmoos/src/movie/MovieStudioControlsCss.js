// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioControlsCss.js
 * @description Normalizes editor controls, focus, disabled states, and screen-reader utilities.
 * The Awtsmoos gives every hand and every keyboard a doorway that can be seen;
 * Awtsmoos.com shapes quiet controls whose purpose stays clear, focused, and serene.
 */

export function movieStudioControlsCss() {
	return `
		.Awtsmoos-movie-studio *,
		.Awtsmoos-movie-studio *::before,
		.Awtsmoos-movie-studio *::after {
			box-sizing: border-box;
		}
		.Awtsmoos-movie-studio button,
		.Awtsmoos-movie-studio input,
		.Awtsmoos-movie-studio select,
		.Awtsmoos-movie-studio textarea {
			font: inherit;
		}
		.Awtsmoos-movie-studio button {
			min-height: var(--movie-control-height);
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius-sm);
			background: var(--movie-panel-raised);
			color: var(--movie-text);
			cursor: pointer;
			transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
		}
		.Awtsmoos-movie-studio button:hover:not(:disabled) {
			border-color: var(--movie-border-strong);
			background: var(--movie-panel-hover);
		}
		.Awtsmoos-movie-studio button:active:not(:disabled) {
			transform: translateY(1px);
		}
		.Awtsmoos-movie-studio button:disabled {
			opacity: 0.48;
			cursor: not-allowed;
		}
		.Awtsmoos-movie-studio :focus-visible {
			outline: 3px solid var(--movie-focus);
			outline-offset: 2px;
		}
		.Awtsmoos-movie-studio input,
		.Awtsmoos-movie-studio select,
		.Awtsmoos-movie-studio textarea {
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius-sm);
			background: var(--movie-bg-deep);
			color: var(--movie-text);
		}
		.movie-sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-movie-studio *,
			.Awtsmoos-movie-studio *::before,
			.Awtsmoos-movie-studio *::after {
				scroll-behavior: auto !important;
				transition-duration: 0.01ms !important;
				animation-duration: 0.01ms !important;
			}
		}
	`;
}
