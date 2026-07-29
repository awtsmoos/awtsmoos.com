// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineTrackCss.js
 * @description Styles density-aware track rows, sticky labels, true-second grids, and playhead spine.
 * The Awtsmoos renews every lane while time flows beneath the eye; Awtsmoos.com
 * keeps labels near, seconds measured, and the playhead clear beneath every chosen density.
 */

export function movieTimelineTrackCss() {
	return `
		.movie-track {
			display: grid;
			grid-template-columns: var(--movie-track-header-width) auto;
			width: max-content;
			min-width: 100%;
			min-height: var(--movie-track-height);
			border-bottom: 1px solid var(--movie-border);
		}
		.movie-track:nth-of-type(even) .movie-track-lane {
			background-color: var(--movie-surface-track-even);
		}
		.movie-track:nth-of-type(odd) .movie-track-lane {
			background-color: var(--movie-surface-track-odd);
		}
		.movie-track-label {
			position: sticky;
			left: 0;
			z-index: 6;
			display: grid;
			align-content: center;
			min-width: 0;
			padding: var(--movie-space-2) var(--movie-space-3);
			border-right: 1px solid var(--movie-border-strong);
			background: var(--movie-surface-inspector);
			overflow: hidden;
		}
		.movie-track-label span,
		.movie-track-label strong {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.movie-track-label span {
			color: var(--movie-text-muted);
			font-size: 10px;
			letter-spacing: .08em;
			text-transform: uppercase;
		}
		.movie-track-label strong {
			font-size: 12px;
		}
		.movie-track-lane {
			position: relative;
			min-width: 100%;
			background-image: repeating-linear-gradient(
				90deg,
				transparent 0 calc(var(--movie-timeline-second-width, 40px) - 1px),
				rgb(255 255 255 / .045) var(--movie-timeline-second-width, 40px)
			);
		}
		.movie-playhead {
			position: absolute;
			top: 98px;
			bottom: 0;
			z-index: 11;
			width: 2px;
			background: var(--movie-playhead);
			box-shadow: 0 0 0 1px rgb(0 0 0 / .45);
			pointer-events: none;
		}
	`;
}
