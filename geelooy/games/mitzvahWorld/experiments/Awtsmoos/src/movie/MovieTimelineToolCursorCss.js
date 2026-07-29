// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolCursorCss.js
 * @description Styles localized cursors and drag-delta evidence for navigation and professional timeline tools.
 * The Awtsmoos is beyond cursor and delta while each finite mode must remain unmistakable before a gesture begins;
 * Awtsmoos.com gives every clip and empty canvas one truthful pointer language without conflicting skins.
 */

export function movieTimelineToolCursorCss() {
	return `
		.movie-timeline-shell[data-tool="blade"],
		.movie-timeline-shell[data-tool="blade"] .movie-clip { cursor: crosshair; }
		.movie-timeline-shell[data-tool="hand"],
		.movie-timeline-shell[data-tool="hand"] .movie-clip {
			cursor: grab;
			user-select: none;
		}
		.movie-timeline-shell[data-tool="hand"].is-panning,
		.movie-timeline-shell[data-tool="hand"].is-panning .movie-clip { cursor: grabbing; }
		.movie-timeline-shell[data-tool="zoom"],
		.movie-timeline-shell[data-tool="zoom"] .movie-clip { cursor: zoom-in; }
		.movie-timeline-shell[data-tool="ripple"] .movie-clip,
		.movie-timeline-shell[data-tool="roll"] .movie-clip,
		.movie-timeline-shell[data-tool="slip"] .movie-clip,
		.movie-timeline-shell[data-tool="slide"] .movie-clip,
		.movie-timeline-shell[data-tool="rateStretch"] .movie-clip { cursor: ew-resize; }
		.movie-timeline-shell[data-tool="ripple"],
		.movie-timeline-shell[data-tool="roll"],
		.movie-timeline-shell[data-tool="slip"],
		.movie-timeline-shell[data-tool="slide"],
		.movie-timeline-shell[data-tool="rateStretch"] { cursor: default; }
		.movie-clip.is-tool-dragging::after {
			position: absolute;
			left: 50%;
			top: -28px;
			z-index: 20;
			min-width: 68px;
			padding: 5px 8px;
			border: 1px solid var(--movie-accent);
			border-radius: var(--movie-radius-sm);
			background: var(--movie-panel-raised);
			color: var(--movie-text);
			content: attr(data-tool-delta);
			font: 700 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
			text-align: center;
			transform: translateX(-50%);
			white-space: nowrap;
		}
	`;
}
