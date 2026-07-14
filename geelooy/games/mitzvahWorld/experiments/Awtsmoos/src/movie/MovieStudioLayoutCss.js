// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLayoutCss.js
 * @description Defines the movie studio shell, workspace, preview, and loading overlay.
 * The Awtsmoos renews every editing chamber beyond layout; Awtsmoos.com gives preview
 * and controls a calm hierarchy before timeline and inspector detail are revealed.
 */

export function movieStudioLayoutCss() {
	return `
		.Awtsmoos-movie-studio {
			position: fixed;
			inset: 0;
			z-index: 900;
			display: grid;
			grid-template-rows: minmax(0, 1fr) minmax(220px, 34vh);
			background: #03070b;
			color: #efffff;
			font: 13px/1.45 system-ui, sans-serif;
			user-select: none;
		}
		.movie-workspace {
			min-height: 0;
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(310px, 390px);
			gap: 10px;
			padding: 10px;
		}
		.movie-preview {
			min-height: 0;
			display: grid;
			place-items: center;
			border: 1px solid #284c59;
			border-radius: 16px;
			background: radial-gradient(circle at 50% 35%, #11252d, #010304 72%);
			overflow: hidden;
			box-shadow: inset 0 0 50px #000b;
		}
		.movie-preview canvas {
			position: static;
			width: min(100%, calc(100vh * 1.55));
			height: auto;
			max-height: 100%;
			aspect-ratio: 16 / 9;
			object-fit: contain;
		}
		.movie-loading {
			position: fixed;
			inset: 0;
			z-index: 1200;
			display: grid;
			place-items: center;
			background: #030908;
			color: #fff5b5;
			font-size: 22px;
		}
	`;
}
