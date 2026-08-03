// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLayoutCss.js
 * @description Gives the 3D monitor first claim while containing wide timeline content inside its own scroll vessel.
 * The Awtsmoos renews the boundless world inside measured rows; Awtsmoos.com lets the living image
 * receive spacious Malchus while long cinematic time scrolls inward without widening the page itself.
 */

export function movieStudioLayoutCss() {
	return `
		.Awtsmoos-movie-studio {
			--movie-timeline-compact-height: 112px;
			position: fixed;
			inset: 0;
			z-index: 2147483000;
			display: grid;
			grid-template-rows: auto minmax(0, 1fr) var(--movie-splitter-size) var(--movie-timeline-compact-height) auto;
			width: 100vw;
			max-width: 100vw;
			min-width: 0;
			min-height: 0;
			overflow: hidden;
			contain: layout paint size;
			background: var(--movie-surface-canvas);
			color: var(--movie-text);
			font: 14px/1.4 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		}
		.Awtsmoos-movie-studio.is-timeline-expanded {
			grid-template-rows: auto minmax(0, 1fr) var(--movie-splitter-size) var(--movie-timeline-height) auto;
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
			position: relative;
			display: grid;
			grid-template-rows: auto minmax(0, 1fr) auto auto;
			min-width: 0;
			min-height: 0;
			overflow: hidden;
			background: #050608;
		}
		.Awtsmoos-movie-studio > [data-timeline] {
			width: 100%;
			max-width: 100%;
			min-width: 0;
			min-height: 0;
			overflow: auto;
			overscroll-behavior: contain;
			contain: layout paint inline-size;
			border-top: 1px solid var(--movie-border);
			background: var(--movie-surface-timeline);
		}
		.Awtsmoos-movie-studio.is-cinema-focus {
			grid-template-rows: 0 minmax(0, 1fr) 0 0 0;
		}
		.Awtsmoos-movie-studio.is-cinema-focus > .movie-studio-bar,
		.Awtsmoos-movie-studio.is-cinema-focus > .movie-timeline-splitter,
		.Awtsmoos-movie-studio.is-cinema-focus > .movie-studio-timeline,
		.Awtsmoos-movie-studio.is-cinema-focus > .movie-studio-status-bar {
			display: none;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-workspace {
			grid-template-columns: minmax(0, 1fr);
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-inspector,
		.Awtsmoos-movie-studio.is-cinema-focus .movie-inspector-splitter {
			display: none;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-preview-column {
			grid-template-rows: minmax(0, 1fr);
		}
	`;
}
