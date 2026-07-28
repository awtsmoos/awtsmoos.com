// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieStudioLayoutCss.js
 * @description Shapes the active editor shell, preview monitor, transport, and status region.
 * The Awtsmoos reveals one world through many bounded panes; Awtsmoos.com lets the
 * preview breathe, the timeline remain, and no narrow vessel shatter under strain.
 */
export function movieStudioLayoutCss() {
	return `
		.Awtsmoos-movie-studio {
			position: fixed;
			inset: 0;
			z-index: 40;
			display: grid;
			grid-template-rows: auto minmax(0, 1fr) var(--movie-timeline-height);
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
			min-height: var(--movie-header-height);
			padding: var(--movie-space-2) var(--movie-space-4);
			border-bottom: 1px solid var(--movie-border);
			background: var(--movie-bg);
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
			grid-template-columns: minmax(0, 1fr) minmax(280px, var(--movie-inspector-width, 340px));
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}
		.movie-studio-preview-column {
			display: grid;
			grid-template-rows: minmax(0, 1fr) auto auto;
			min-width: 0;
			min-height: 0;
			background: var(--movie-bg-deep);
		}
		.movie-studio-preview-shell {
			display: flex;
			align-items: center;
			justify-content: center;
			min-width: 0;
			min-height: 0;
			padding: var(--movie-space-4);
			overflow: hidden;
		}
		.movie-studio-preview {
			position: relative;
			height: min(100%, 675px);
			width: auto;
			max-width: min(100%, 1200px);
			min-height: 0;
			aspect-ratio: var(--movie-aspect-ratio, 16 / 9);
			box-sizing: border-box;
			overflow: hidden;
			border: 1px solid var(--movie-border-strong);
			border-radius: var(--movie-radius-lg);
			background: #000;
			box-shadow: var(--movie-shadow);
		}
		.movie-studio-preview canvas {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
		}
		.movie-studio-dialogue {
			position: absolute;
			left: var(--movie-space-4);
			right: var(--movie-space-4);
			bottom: var(--movie-space-4);
			padding: var(--movie-space-3);
			border-radius: var(--movie-radius);
			background: rgb(4 8 13 / 0.78);
			text-align: center;
			pointer-events: none;
		}
		.movie-studio-transport {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: var(--movie-space-2);
			padding: var(--movie-space-2) var(--movie-space-4);
			border-top: 1px solid var(--movie-border);
			background: var(--movie-bg);
		}
		.movie-studio-status {
			min-height: 32px;
			padding: var(--movie-space-2) var(--movie-space-4);
			color: var(--movie-text-muted);
			text-align: center;
			background: var(--movie-bg);
		}
	`;
}
