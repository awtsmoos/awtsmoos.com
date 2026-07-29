// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolbarCss.js
 * @description Styles the named container, command toolbar, and adaptive ruler.
 * The Awtsmoos renews each second while the ruler appears to stand; Awtsmoos.com
 * keeps dense commands reachable and gives descendants a real container for local decisions.
 */

export function movieTimelineToolbarCss() {
	return `
		.movie-timeline-shell {
			position: relative;
			container: movie-timeline / inline-size;
			height: 100%;
			min-width: 0;
			min-height: 0;
			overflow: auto;
			overscroll-behavior: contain;
			touch-action: pan-x pan-y;
			scrollbar-gutter: stable;
			border-top: 1px solid var(--movie-border-strong);
			background: var(--movie-track);
		}
		.movie-timeline-shell.is-scrubbing {
			cursor: ew-resize;
			user-select: none;
			touch-action: none;
		}
		.movie-timeline-toolbar {
			position: sticky;
			top: 0;
			left: 0;
			z-index: 12;
			display: flex;
			align-items: center;
			gap: var(--movie-space-2);
			width: max-content;
			min-width: 100%;
			height: 44px;
			padding: var(--movie-space-1) var(--movie-space-3);
			border-bottom: 1px solid var(--movie-border);
			background: color-mix(in srgb, var(--movie-surface-toolbar) 96%, transparent);
			backdrop-filter: blur(10px);
		}
		.movie-timeline-toolbar button {
			min-width: var(--movie-control-height);
			min-height: 34px;
			white-space: nowrap;
		}
		.movie-timeline-toolbar strong,
		.movie-timeline-toolbar output {
			font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
			font-size: 12px;
			white-space: nowrap;
		}
		.movie-timeline-toolbar > span {
			margin-left: auto;
			color: var(--movie-text-muted);
			white-space: nowrap;
		}
		.movie-ruler {
			position: sticky;
			top: 44px;
			z-index: 7;
			height: 30px;
			margin-left: var(--movie-track-header-width);
			border-bottom: 1px solid var(--movie-border-strong);
			background: var(--movie-ruler);
		}
		.movie-ruler span {
			position: absolute;
			inset-block: 0;
			padding: 6px 0 0 6px;
			border-left: 1px solid var(--movie-border-strong);
			color: var(--movie-text-muted);
			font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
			font-size: 10px;
		}
	`;
}
