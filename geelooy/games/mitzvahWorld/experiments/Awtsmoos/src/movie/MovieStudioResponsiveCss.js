// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioResponsiveCss.js
 * @description Gives desktop, tablet, and mobile distinct editor compositions.
 * The Awtsmoos pours one creative purpose into every changing screen; Awtsmoos.com
 * keeps preview, transport, timeline, and inspector reachable, deliberate, and clean.
 */

export function movieStudioResponsiveCss() {
	return `
		@media (min-width: 981px) {
			.Awtsmoos-movie-studio:not(.is-inspector-open) .movie-studio-workspace {
				grid-template-columns: minmax(0, 1fr);
			}
			.Awtsmoos-movie-studio:not(.is-inspector-open) .movie-studio-inspector {
				display: none;
			}
		}
		@media (max-width: 980px) {
			.Awtsmoos-movie-studio {
				--movie-timeline-height: clamp(260px, 38vh, 390px);
			}
			.movie-studio-workspace {
				grid-template-columns: minmax(0, 1fr);
			}
			.movie-studio-inspector {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				z-index: 8;
				width: min(390px, calc(100vw - 32px));
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
		}
		@media (max-width: 640px) {
			.Awtsmoos-movie-studio {
				--movie-header-height: 54px;
				--movie-timeline-height: clamp(300px, 43vh, 410px);
				--movie-track-header-width: 108px;
				font-size: 13px;
			}
			.movie-studio-bar {
				padding-inline: var(--movie-space-3);
			}
			.movie-studio-bar .movie-secondary-label {
				display: none;
			}
			.movie-studio-preview-shell {
				padding: var(--movie-space-2);
			}
			.movie-studio-preview {
				width: 100%;
				max-height: 100%;
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
				padding-inline: var(--movie-space-2);
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
				max-height: min(72vh, 620px);
				border-radius: var(--movie-radius-lg) var(--movie-radius-lg) 0 0;
				transform: translateY(calc(100% + 24px));
			}
			.Awtsmoos-movie-studio.is-inspector-open .movie-studio-inspector {
				transform: translateY(0);
			}
			.movie-studio-actions,
			.movie-studio-project-summary {
				grid-template-columns: 1fr;
			}
		}
	`;
}
