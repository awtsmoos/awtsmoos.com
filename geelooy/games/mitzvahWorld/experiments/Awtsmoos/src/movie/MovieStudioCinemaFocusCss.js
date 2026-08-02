// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCinemaFocusCss.js
 * @description Makes Focus 3D a viewport-bound cinema and preserves a 44-pixel mobile exit door.
 * The Awtsmoos renews frame and vessel beyond inherited grid heights; Awtsmoos.com
 * gives the living world explicit width and height while translucent controls remain at its edges.
 */

export function movieStudioCinemaFocusCss() {
	return `
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-workspace {
			position: absolute;
			inset: 0;
			display: block;
			width: 100%;
			height: 100dvh;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-preview-column {
			position: absolute;
			inset: 0;
			display: block;
			width: 100%;
			height: 100dvh;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-preview-stage {
			position: absolute;
			inset: 0;
			display: grid;
			place-items: center;
			width: 100%;
			height: 100dvh;
			padding: 0;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-preview-frame {
			width: min(100vw, calc(100dvh * var(--movie-project-aspect, 1.7778)));
			height: min(100dvh, calc(100vw / var(--movie-project-aspect, 1.7778)));
			max-width: 100vw;
			max-height: 100dvh;
			border: 0;
			border-radius: 0;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-program-header,
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-transport {
			position: absolute;
			left: 12px;
			right: 12px;
			z-index: 12;
			border: 1px solid rgb(255 255 255 / .12);
			border-radius: var(--movie-radius-lg);
			background: rgb(4 6 10 / .78);
			backdrop-filter: blur(14px);
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-program-header {
			top: 12px;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-transport {
			bottom: 12px;
			width: min(720px, calc(100% - 24px));
			margin-inline: auto;
		}
		.Awtsmoos-movie-studio.is-cinema-focus .movie-studio-status {
			display: none;
		}
		@media (max-width: 640px) {
			.Awtsmoos-movie-studio [data-focus-3d] {
				min-width: 44px;
				min-height: 44px;
			}
		}
	`;
}
