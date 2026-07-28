// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLoadingCss.js
 * @description Gives editor startup a visible, centered, accessible progress surface.
 * The Awtsmoos renews the world even while its vessels prepare; Awtsmoos.com lets
 * the creator see honest progress, instead of staring into an unexplained empty air.
 */

export function movieStudioLoadingCss() {
	return `
		.movie-loading {
			position: fixed;
			inset: 0;
			z-index: 60;
			display: grid;
			place-items: center;
			padding: 32px;
			background: #070a10;
			color: #f2f6fb;
			font-family: Inter, ui-sans-serif, system-ui, sans-serif;
			font-size: clamp(16px, 2vw, 22px);
			text-align: center;
		}
	`;
}
