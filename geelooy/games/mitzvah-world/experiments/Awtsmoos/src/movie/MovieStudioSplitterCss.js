// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSplitterCss.js
 * @description Styles every named pane and track separator for pointer, touch, keyboard, and contrast.
 * The Awtsmoos is beyond division, yet each vessel may resize;
 * Awtsmoos.com makes every separator visible to hands and eyes.
 */

export function movieStudioSplitterCss() {
	return `
		.movie-studio-splitter,
		.movie-track-header-splitter {
			position: relative;
			z-index: 15;
			outline: 0;
			touch-action: none;
		}
		.movie-studio-splitter::after,
		.movie-track-header-splitter::after {
			position: absolute;
			content: "";
			border-radius: 999px;
			background: var(--movie-divider-subtle);
			transition: background 120ms ease, box-shadow 120ms ease;
		}
		.movie-studio-splitter-inspector,
		.movie-inspector-splitter {
			cursor: col-resize;
			background: var(--movie-bg-deep);
		}
		.movie-studio-splitter-inspector::after,
		.movie-inspector-splitter::after {
			inset: 8px 3px;
		}
		.movie-studio-splitter-timeline,
		.movie-timeline-splitter {
			cursor: row-resize;
			background: var(--movie-bg-deep);
		}
		.movie-studio-splitter-timeline::after,
		.movie-timeline-splitter::after {
			inset: 3px 12px;
		}
		.movie-track-header-splitter {
			position: absolute;
			top: 98px;
			bottom: 0;
			left: calc(var(--movie-track-header-width) - 4px);
			width: 8px;
			cursor: col-resize;
		}
		.movie-track-header-splitter::after {
			inset: 4px 3px;
		}
		.movie-studio-splitter:hover::after,
		.movie-track-header-splitter:hover::after,
		.movie-studio-splitter:focus-visible::after,
		.movie-track-header-splitter:focus-visible::after,
		.is-resizing .movie-studio-splitter::after,
		.is-resizing .movie-track-header-splitter::after {
			background: var(--movie-accent);
			box-shadow: 0 0 0 2px color-mix(in srgb, var(--movie-accent) 28%, transparent);
		}
		.Awtsmoos-movie-studio.is-resizing,
		.Awtsmoos-movie-studio.is-resizing * {
			user-select: none;
		}
	`;
}
