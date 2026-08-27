// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLayoutCss.js
 * @description Shapes the resizable five-row editor grid with internally scrollable bounded regions.
 * The Awtsmoos reveals one world through many measured panes; Awtsmoos.com lets preview,
 * inspector, timeline, transport, and status breathe without forcing the document beyond its shore.
 */

export function movieStudioLayoutCss() {
	return `
		.Awtsmoos-movie-studio {
			position: fixed;
			inset: 0;
			z-index: 40;
			display: grid;
			grid-template-rows: auto minmax(0, 1fr) var(--movie-splitter-size) var(--movie-timeline-row-height, var(--movie-timeline-height)) auto;
			min-width: 0;
			min-height: 0;
			padding: var(--movie-safe-top) var(--movie-safe-right) var(--movie-safe-bottom) var(--movie-safe-left);
			overflow: hidden;
			background: var(--movie-bg-deep);
		}
		.movie-studio-bar {
			display: flex;
			align-items: center;
			gap: var(--movie-space-3);
			min-width: 0;
			min-height: var(--movie-header-height);
			padding: var(--movie-space-2) var(--movie-space-4);
			border-bottom: 1px solid var(--movie-divider-subtle);
			background: var(--movie-surface-toolbar);
		}
		.movie-studio-brand {
			min-width: 0;
			margin-right: auto;
		}
		.movie-studio-brand strong,
		.movie-studio-brand span {
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.movie-studio-brand span {
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-studio-workspace {
			position: relative;
			display: grid;
			grid-template-columns: minmax(0, 1fr) var(--movie-splitter-size) minmax(280px, var(--movie-inspector-width));
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}
		.movie-studio-preview-column {
			display: grid;
			grid-template-rows: minmax(0, 1fr) auto auto;
			min-width: 0;
			min-height: 0;
			background: var(--movie-surface-canvas);
		}
		.movie-studio-transport {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: var(--movie-space-2);
			padding: var(--movie-space-2) var(--movie-space-4);
			border-top: 1px solid var(--movie-divider-subtle);
			background: var(--movie-surface-toolbar);
		}
		.movie-studio-status {
			min-height: 32px;
			padding: var(--movie-space-2) var(--movie-space-4);
			color: var(--movie-text-muted);
			text-align: center;
			background: var(--movie-surface-toolbar);
		}
		.Awtsmoos-movie-studio > [data-timeline] {
			min-width: 0;
			min-height: 0;
			overflow: auto;
			overscroll-behavior: contain;
			scrollbar-gutter: stable;
		}
	`;
}
