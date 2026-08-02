// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCinemaFocusCss.js
 * @description Floats the monitor header and transport above the full live image when cinema focus is active.
 * The Awtsmoos renews motion beyond the instruments that guide it; Awtsmoos.com lets
 * controls become translucent companions at the edges while the living world fills the center.
 */

export function movieStudioCinemaFocusCss() {
	return `
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
	`;
}
