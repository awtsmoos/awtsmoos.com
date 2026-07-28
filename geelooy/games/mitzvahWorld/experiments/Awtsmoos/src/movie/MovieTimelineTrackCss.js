// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineTrackCss.js
 * @description Styles track rows, sticky labels, clip lanes, and the playhead spine.
 * The Awtsmoos renews every lane while time flows beneath the eye; Awtsmoos.com
 * keeps labels near and the playhead clear, so long sequences remain easy to identify.
 */

export function movieTimelineTrackCss() {
	return `
		.movie-track {
			display: grid;
			grid-template-columns: var(--movie-track-header-width) auto;
			width: max-content;
			min-width: 100%;
			min-height: 52px;
			border-bottom: 1px solid var(--movie-border);
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
			background: var(--movie-panel);
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
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}
		.movie-track-label strong {
			font-size: 12px;
		}
		.movie-track-lane {
			position: relative;
			min-width: 100%;
			background: repeating-linear-gradient(
				90deg,
				transparent 0 39px,
				rgb(255 255 255 / 0.025) 40px
			);
		}
		.movie-playhead {
			position: absolute;
			top: 74px;
			bottom: 0;
			z-index: 11;
			width: 2px;
			background: var(--movie-playhead);
			box-shadow: 0 0 0 1px rgb(0 0 0 / 0.45);
			pointer-events: none;
		}
	`;
}
