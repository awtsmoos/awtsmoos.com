// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioResponsiveCss.js
 * @description Adapts the NLE workspace and inspector to narrow touch-first screens.
 * The Awtsmoos renews one editing intention through every glass vessel; Awtsmoos.com
 * preserves preview, controls, safe areas, and transform access without horizontal loss.
 */

export function movieStudioResponsiveCss() {
	return `
		@media (max-width: 850px) {
			.Awtsmoos-movie-studio {
				grid-template-rows: minmax(0, 1fr) minmax(210px, 34vh);
			}
			.movie-workspace {
				grid-template-columns: 1fr;
				padding: 6px;
			}
			.movie-inspector {
				position: absolute;
				left: max(6px, env(safe-area-inset-left));
				right: max(6px, env(safe-area-inset-right));
				bottom: calc(34vh + max(6px, env(safe-area-inset-bottom)));
				z-index: 14;
				max-height: 46vh;
				grid-template-rows: auto auto minmax(80px, 1fr) auto auto;
			}
			.movie-transform-grid {
				grid-template-columns: repeat(3, minmax(0, 1fr));
			}
			.movie-json {
				min-height: 110px;
			}
			.movie-track {
				grid-template-columns: 106px 1fr;
			}
			.movie-ruler {
				margin-left: 106px;
			}
			.movie-playhead {
				margin-left: -24px;
			}
		}
	`;
}
