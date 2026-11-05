// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioResponsiveCss.js
 * @description Constrains pane preferences into desktop, tablet, portrait, and landscape vessels.
 * The Awtsmoos pours one creative purpose into every changing screen; Awtsmoos.com
 * preserves authored ratios, touch doors, and bounded sheets wherever width or height may turn.
 */

export function movieStudioResponsiveCss() {
	return `
		@media (min-width: 981px) {
			.Awtsmoos-movie-studio:not(.is-inspector-open) .movie-studio-workspace {
				grid-template-columns: minmax(0, 1fr);
			}
			.Awtsmoos-movie-studio:not(.is-inspector-open) .movie-studio-inspector,
			.Awtsmoos-movie-studio:not(.is-inspector-open) .movie-inspector-splitter {
				display: none;
			}
		}
		@media (max-width: 980px) {
			.Awtsmoos-movie-studio {
				--movie-timeline-row-height: min(var(--movie-timeline-height), 38vh);
			}
			.movie-studio-workspace {
				grid-template-columns: minmax(0, 1fr);
			}
			.movie-inspector-splitter {
				display: none;
			}
			.movie-studio-inspector {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				z-index: 18;
				width: min(var(--movie-inspector-width), calc(100vw - 32px));
				border: 1px solid var(--movie-border-strong);
				border-radius: 0 0 0 var(--movie-radius-lg);
				box-shadow: var(--movie-shadow);
				transform: translateX(calc(100% + 24px));
				visibility: hidden;
				transition: transform 160ms ease, visibility 160ms ease;
			}
			.Awtsmoos-movie-studio.is-inspector-open .movie-studio-inspector {
				transform: translateX(0);
				visibility: visible;
			}
			.movie-utility-toolbar button,
			.movie-studio-bar > button {
				min-height: var(--movie-touch-height);
			}
		}
		@media (max-width: 640px) {
			.Awtsmoos-movie-studio {
				--movie-timeline-row-height: min(var(--movie-timeline-height), 43vh);
			}
			.movie-studio-bar {
				padding-inline: var(--movie-space-2);
			}
			.movie-studio-bar .movie-secondary-label {
				display: none;
			}
			.movie-studio-preview-stage {
				padding: var(--movie-space-2);
			}
			.movie-studio-preview-frame {
				border-radius: var(--movie-radius);
			}
			.movie-studio-transport {
				justify-content: stretch;
				gap: var(--movie-space-1);
				padding-inline: var(--movie-space-2);
			}
			.movie-studio-transport button {
				flex: 1 1 0;
				min-width: 0;
				min-height: var(--movie-touch-height);
			}
			.movie-studio-status {
				padding-inline: var(--movie-space-2);
				font-size: 12px;
			}
			.movie-studio-inspector {
				top: auto;
				left: 0;
				right: 0;
				bottom: 0;
				width: auto;
				max-height: min(72dvh, 100%);
				border-radius: var(--movie-radius-lg) var(--movie-radius-lg) 0 0;
				transform: translateY(calc(100% + 24px));
			}
			.Awtsmoos-movie-studio.is-inspector-open .movie-studio-inspector {
				transform: translateY(0);
			}
		}
	`;
}
