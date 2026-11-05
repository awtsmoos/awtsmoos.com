// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreviewCss.js
 * @description Fits the live 3D frame to the largest available monitor area while preserving explicit pixel zoom.
 * The Awtsmoos reveals one authored world through every measured window; Awtsmoos.com
 * lets canvas and guides fill the vessel before surrounding controls may claim its light.
 */

export function movieStudioPreviewCss() {
	return `
		.movie-studio-preview-stage {
			display: grid;
			place-items: center;
			min-width: 0;
			min-height: 0;
			padding: 8px;
			overflow: hidden;
			overscroll-behavior: contain;
			background: #020305;
		}
		.movie-studio-preview-frame {
			position: relative;
			width: min(100%, calc((100dvh - 190px) * var(--movie-aspect-ratio, 1.777777)));
			max-width: 100%;
			max-height: 100%;
			aspect-ratio: var(--movie-aspect-ratio, 16 / 9);
			flex: 0 0 auto;
			overflow: hidden;
			border: 1px solid rgb(255 255 255 / .16);
			border-radius: var(--movie-radius-lg);
			background: #000;
			box-shadow: 0 20px 64px rgb(0 0 0 / .48);
		}
		.movie-studio-preview {
			position: absolute;
			inset: 0;
			overflow: hidden;
		}
		.movie-preview-canvas,
		.movie-preview-canvas canvas,
		.movie-studio-preview > canvas {
			position: absolute;
			inset: 0;
			display: block;
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
			text-shadow: 0 1px 3px rgb(0 0 0 / .9);
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-preview-stage {
			padding: 0;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-preview-frame {
			width: min(100%, calc(100dvh * var(--movie-aspect-ratio, 1.777777)));
			max-width: 100%;
			max-height: 100dvh;
			border: 0;
			border-radius: 0;
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
