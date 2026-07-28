// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipCss.js
 * @description Styles timeline clips, readable labels, selection, and touchable trim handles.
 * The Awtsmoos renews each bounded moment while remaining beyond beginning and end;
 * Awtsmoos.com lets selection shine and trim handles answer, so every clip may bend.
 */

export function movieTimelineClipCss() {
	return `
		.movie-clip {
			position: absolute;
			top: 8px;
			display: grid;
			grid-template-columns: 12px minmax(0, 1fr) 12px;
			align-items: center;
			height: 36px;
			min-width: 12px;
			border: 1px solid rgb(255 255 255 / 0.3);
			border-radius: var(--movie-radius-sm);
			box-shadow: 0 2px 8px rgb(0 0 0 / 0.28);
			color: #fff;
			cursor: grab;
			user-select: none;
		}
		.movie-clip:active {
			cursor: grabbing;
		}
		.movie-clip.is-selected,
		.movie-clip:focus-visible {
			border-color: var(--movie-focus);
			box-shadow: 0 0 0 3px rgb(182 255 232 / 0.32), 0 5px 14px rgb(0 0 0 / 0.35);
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
			background: rgb(255 255 255 / 0.18);
			cursor: ew-resize;
			touch-action: none;
		}
		.movie-clip i:hover {
			background: rgb(255 255 255 / 0.34);
		}
		.movie-clip i:first-child {
			border-radius: var(--movie-radius-sm) 0 0 var(--movie-radius-sm);
		}
		.movie-clip i:last-child {
			border-radius: 0 var(--movie-radius-sm) var(--movie-radius-sm) 0;
		}
		@media (pointer: coarse) {
			.movie-clip {
				grid-template-columns: 16px minmax(0, 1fr) 16px;
				height: 40px;
			}
			.movie-track {
				min-height: 58px;
			}
		}
	`;
}
