// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreviewCss.js
 * @description Fits the program frame and its authored overlay while preserving deliberate pixel zoom.
 * The Awtsmoos reveals one authored world through every measured window; Awtsmoos.com
 * keeps canvas, guides, overlay, and frame proportional while explicit pixel inspection remains scrollable.
 */

export function movieStudioPreviewCss() {
	return `
		.movie-studio-preview-stage {
			display: grid;
			place-items: center;
			min-width: 0;
			min-height: 0;
			padding: var(--movie-space-4);
			overflow: auto;
			overscroll-behavior: contain;
			background: var(--movie-surface-canvas);
		}
		.movie-studio-preview-frame {
			position: relative;
			width: min(100%, calc((100% - 2px) * 1));
			max-width: calc((100vh - 220px) * var(--movie-aspect-ratio, 1.777777));
			aspect-ratio: var(--movie-aspect-ratio, 16 / 9);
			flex: 0 0 auto;
			overflow: hidden;
			border: 1px solid var(--movie-border-strong);
			border-radius: var(--movie-radius-lg);
			background: #000;
			box-shadow: var(--movie-shadow);
		}
		.movie-studio-preview {
			position: absolute;
			inset: 0;
			overflow: hidden;
		}
		.movie-preview-canvas,
		.movie-preview-canvas canvas {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
		}
		.movie-preview-overlay {
			position: absolute;
			inset: 0;
			z-index: 3;
			display: grid;
			place-items: center;
			pointer-events: none;
			color: var(--movie-text);
			text-shadow: 0 1px 3px rgb(0 0 0 / 0.9);
		}
		.Awtsmoos-movie-studio[data-preview-zoom="100%"] .movie-studio-preview-frame {
			width: var(--movie-project-width, 1920px);
			max-width: none;
		}
		.Awtsmoos-movie-studio[data-preview-zoom="150%"] .movie-studio-preview-frame {
			width: calc(var(--movie-project-width, 1920px) * 1.5);
			max-width: none;
		}
		.Awtsmoos-movie-studio[data-preview-zoom="200%"] .movie-studio-preview-frame {
			width: calc(var(--movie-project-width, 1920px) * 2);
			max-width: none;
		}
	`;
}
