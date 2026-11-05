// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineCommandCss.js
 * @description Styles responsive command groups, active snapping, and scale-aware marker landmarks.
 * The Awtsmoos renews command and landmark through one light; Awtsmoos.com keeps
 * dense tools reachable, disabled meaning readable, and marker names proportional to zoom.
 */

export function movieTimelineCommandCss() {
	return `
		.movie-timeline-command-group {
			display: flex;
			align-items: center;
			gap: var(--movie-space-1);
			padding-right: var(--movie-space-2);
			border-right: 1px solid var(--movie-border);
		}
		.movie-timeline-toolbar button.is-active,
		.movie-timeline-toolbar button[aria-pressed="true"] {
			border-color: var(--movie-accent);
			background: color-mix(in srgb, var(--movie-accent) 22%, var(--movie-panel));
			color: var(--movie-text);
		}
		.movie-timeline-toolbar button:disabled {
			opacity: .64;
			filter: saturate(.45);
			cursor: not-allowed;
		}
		.movie-marker-lane {
			position: relative;
			height: 24px;
			margin-left: var(--movie-track-header-width);
			border-bottom: 1px solid var(--movie-border-strong);
			background: color-mix(in srgb, var(--movie-ruler) 82%, var(--movie-accent));
		}
		.movie-marker {
			position: absolute;
			top: 0;
			z-index: 9;
			display: grid;
			grid-template-columns: 8px auto;
			align-items: center;
			gap: 3px;
			max-width: 140px;
			height: 23px;
			padding: 0 6px 0 0;
			border: 0;
			background: transparent;
			color: var(--movie-text-muted);
			font-size: 10px;
			transform: translateX(-4px);
		}
		.movie-marker i {
			width: 8px;
			height: 8px;
			background: var(--movie-warning);
			clip-path: polygon(50% 100%, 0 0, 100% 0);
		}
		.movie-marker span {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.movie-marker:focus-visible {
			outline: 2px solid var(--movie-focus);
			outline-offset: -2px;
		}
		.movie-timeline-shell[data-scale-band="overview"] .movie-marker {
			grid-template-columns: 8px;
			padding: 0;
		}
		.movie-timeline-shell[data-scale-band="overview"] .movie-marker span {
			display: none;
		}
		@container movie-timeline (max-width: 880px) {
			.movie-timeline-toolbar > span {
				display: none;
			}
			.movie-timeline-command-group {
				padding-right: var(--movie-space-1);
			}
		}
		@container movie-timeline (max-width: 620px) {
			.movie-timeline-toolbar {
				gap: var(--movie-space-1);
				padding-inline: var(--movie-space-2);
			}
			.movie-timeline-toolbar button {
				min-width: 34px;
				padding-inline: 7px;
			}
		}
	`;
}
