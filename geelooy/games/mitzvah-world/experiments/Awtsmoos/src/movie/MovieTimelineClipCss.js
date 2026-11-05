// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipCss.js
 * @description Styles semantic clips, density geometry, selected-many state, primary identity, dragging, and timing.
 * The Awtsmoos renews each bounded moment beyond color and edge; Awtsmoos.com lets
 * type, focus, many selected vessels, one primary notch, motion, trim, and measured time speak clearly.
 */

export function movieTimelineClipCss() {
	return `
		.movie-track[data-type="actor"] { --movie-clip-color: var(--movie-track-actor); }
		.movie-track[data-type="audio"] { --movie-clip-color: var(--movie-track-audio); }
		.movie-track[data-type="camera"] { --movie-clip-color: var(--movie-track-camera); }
		.movie-track[data-type="crowd"] { --movie-clip-color: var(--movie-track-crowd); }
		.movie-track[data-type="dialogue"] { --movie-clip-color: var(--movie-track-dialogue); }
		.movie-track[data-type="door"] { --movie-clip-color: var(--movie-track-door); }
		.movie-track[data-type="event"] { --movie-clip-color: var(--movie-track-event); }
		.movie-track[data-type="scene"] { --movie-clip-color: var(--movie-track-scene); }
		.movie-track[data-type="sequence"] { --movie-clip-color: var(--movie-track-sequence); }
		.movie-clip {
			position: absolute;
			top: var(--movie-clip-offset);
			display: grid;
			grid-template-columns: var(--movie-trim-width) minmax(0, 1fr) var(--movie-trim-width);
			align-items: center;
			height: var(--movie-clip-height);
			min-width: calc(var(--movie-trim-width) * 2);
			border: 1px solid color-mix(in srgb, var(--movie-clip-color, var(--movie-accent)) 78%, white);
			border-radius: var(--movie-radius-sm);
			background: linear-gradient(180deg, color-mix(in srgb, var(--movie-clip-color, var(--movie-accent)) 76%, #263247), color-mix(in srgb, var(--movie-clip-color, var(--movie-accent)) 45%, #172132));
			box-shadow: inset 0 3px 0 color-mix(in srgb, var(--movie-clip-color, var(--movie-accent)) 90%, white), 0 2px 8px rgb(0 0 0 / .28);
			color: #fff;
			cursor: grab;
			user-select: none;
			transition: transform 100ms ease, box-shadow 100ms ease, opacity 100ms ease;
		}
		.movie-clip:active,
		.movie-clip.is-dragging {
			z-index: 10;
			cursor: grabbing;
			transform: translateY(-2px);
			box-shadow: inset 0 3px 0 color-mix(in srgb, var(--movie-clip-color, var(--movie-accent)) 92%, white), 0 10px 24px rgb(0 0 0 / .52);
		}
		.movie-clip.is-dragging::after {
			position: absolute;
			left: 50%;
			bottom: calc(100% + 6px);
			content: attr(data-timing);
			width: max-content;
			max-width: 260px;
			padding: 4px 7px;
			border: 1px solid var(--movie-border-strong);
			border-radius: 6px;
			background: var(--movie-surface-floating);
			color: var(--movie-text);
			font: 11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
			transform: translateX(-50%);
			pointer-events: none;
		}
		.movie-clip.is-selected,
		.movie-clip:focus-visible {
			border-color: var(--movie-focus);
			outline: 2px solid color-mix(in srgb, var(--movie-focus) 82%, transparent);
			outline-offset: 1px;
		}
		.movie-clip.is-primary-selected {
			box-shadow: inset 0 0 0 2px var(--movie-focus), inset 5px 0 0 var(--movie-text), 0 2px 8px rgb(0 0 0 / .38);
		}
		.movie-clip.is-primary-selected::before {
			position: absolute;
			top: 50%;
			left: -1px;
			content: '';
			width: 0;
			height: 0;
			border-top: 6px solid transparent;
			border-bottom: 6px solid transparent;
			border-left: 6px solid var(--movie-text);
			transform: translateY(-50%);
			pointer-events: none;
		}
		.movie-clip span {
			overflow: hidden;
			padding-inline: var(--movie-space-1);
			font-size: 11px;
			font-weight: 650;
			text-overflow: ellipsis;
			white-space: nowrap;
			pointer-events: none;
		}
		.movie-clip i {
			align-self: stretch;
			background: rgb(255 255 255 / .14);
			cursor: ew-resize;
			touch-action: none;
		}
		.movie-clip i:hover { background: rgb(255 255 255 / .34); }
		.movie-clip i:first-child { border-radius: var(--movie-radius-sm) 0 0 var(--movie-radius-sm); }
		.movie-clip i:last-child { border-radius: 0 var(--movie-radius-sm) var(--movie-radius-sm) 0; }
	`;
}
