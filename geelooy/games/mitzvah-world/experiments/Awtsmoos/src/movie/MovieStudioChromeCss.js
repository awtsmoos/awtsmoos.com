// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioChromeCss.js
 * @description Keeps the essential studio header small and places secondary controls inside one bounded disclosure.
 * The Awtsmoos renews every tool without forcing every tool before the eye; Awtsmoos.com
 * reveals rendering and view choices first while project and utility doors wait in ordered quiet.
 */

export function movieStudioChromeCss() {
	return `
		.movie-studio-bar-compact {
			min-height: 48px;
			padding: 6px 10px;
		}
		.movie-studio-bar-compact .movie-studio-identity {
			min-width: 0;
		}
		.movie-studio-bar-compact .movie-studio-kicker,
		.movie-studio-bar-compact [data-project-meta] {
			font-size: 10px;
			opacity: .72;
		}
		.movie-studio-primary-actions {
			display: flex;
			align-items: center;
			gap: 6px;
		}
		.movie-studio-more-actions {
			position: relative;
		}
		.movie-studio-more-actions summary {
			display: grid;
			place-items: center;
			min-height: var(--movie-control-height);
			padding: 0 12px;
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius);
			cursor: pointer;
			list-style: none;
		}
		.movie-studio-more-actions summary::-webkit-details-marker {
			display: none;
		}
		.movie-studio-more-surface {
			position: absolute;
			top: calc(100% + 8px);
			right: 0;
			z-index: 40;
			display: grid;
			gap: 10px;
			width: min(520px, calc(100vw - 20px));
			padding: 12px;
			border: 1px solid var(--movie-border-strong);
			border-radius: var(--movie-radius-lg);
			background: var(--movie-surface-panel);
			box-shadow: var(--movie-shadow);
		}
		.movie-studio-secondary-actions {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
		}
		@media (max-width: 640px) {
			.movie-studio-bar-compact .movie-studio-kicker,
			.movie-studio-bar-compact [data-project-meta] {
				display: none;
			}
			.movie-studio-more-actions summary,
			.movie-studio-primary-actions button {
				min-height: var(--movie-touch-height);
			}
		}
	`;
}
