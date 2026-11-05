// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityResponsiveCss.js
 * @description Transforms retractable utility surfaces into bounded drawers and accessible mobile bottom sheets.
 * The Awtsmoos renews wide and narrow space without division; Awtsmoos.com lets
 * touch, safe areas, inert backdrop, scroll containment, and landscape height reveal one responsive tool.
 */

export function movieStudioUtilityResponsiveCss() {
	return `
		.Awtsmoos-movie-studio {
			overflow: hidden;
		}
		.movie-utility-panel {
			content-visibility: auto;
			contain: layout paint style;
		}
		.movie-utility-panel[hidden] {
			display: none !important;
		}
		.movie-utility-panel-body {
			overscroll-behavior: contain;
			scrollbar-gutter: stable;
		}
		@media (max-width: 1024px) {
			.movie-utility-renderJobs,
			.movie-utility-diagnostics {
				width: min(420px, calc(100vw - 32px));
			}
		}
		@media (max-width: 720px) {
			.movie-studio-bar {
				gap: var(--movie-space-1);
				padding-inline: var(--movie-space-2);
			}
			.movie-studio-brand strong {
				font-size: 12px;
			}
			.movie-secondary-label {
				display: none;
			}
			.movie-utility-toolbar {
				display: flex;
				margin-inline-start: auto;
			}
			.movie-utility-toolbar button,
			.movie-studio-bar > button,
			.movie-utility-panel button,
			.movie-command-search input {
				min-width: var(--movie-touch-height);
				min-height: var(--movie-touch-height);
			}
			.movie-utility-backdrop {
				position: absolute;
				inset: 0;
				z-index: 79;
				display: block;
				background: rgb(0 0 0 / 0.62);
				backdrop-filter: blur(2px);
			}
			.movie-utility-backdrop[hidden] {
				display: none;
			}
			.movie-utility-panel,
			.movie-utility-commands,
			.movie-utility-renderJobs,
			.movie-utility-diagnostics {
				position: absolute;
				top: auto;
				right: 0;
				bottom: 0;
				left: 0;
				width: 100%;
				max-width: none;
				max-height: min(76dvh, 640px);
				transform: none;
				border: 0;
				border-top: 1px solid var(--movie-border);
				border-radius: var(--movie-radius-lg) var(--movie-radius-lg) 0 0;
				padding-bottom: var(--movie-safe-bottom);
			}
			.movie-utility-panel-header {
				position: sticky;
				top: 0;
				z-index: 1;
				min-height: 52px;
			}
			.movie-command-entry {
				min-height: 52px;
			}
			.movie-studio-status-bar {
				min-height: 38px;
				padding-inline: var(--movie-space-2);
				overflow-x: auto;
			}
		}
		@media (max-width: 720px) and (max-height: 500px) and (orientation: landscape) {
			.movie-utility-panel,
			.movie-utility-commands,
			.movie-utility-renderJobs,
			.movie-utility-diagnostics {
				max-height: 88dvh;
			}
		}
	`;
}
