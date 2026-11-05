// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLiveMonitorCss.js
 * @description Styles the live renderer badge, compact monitor header, and honest loading state around the actual canvas.
 * The Awtsmoos renews world before label and frame; Awtsmoos.com lets the green signal,
 * dark cinema vessel, and vanishing loading message distinguish living WebGL from empty appearance.
 */

export function movieStudioLiveMonitorCss() {
	return `
		.movie-program-header {
			min-height: 42px;
			padding: 6px 10px;
			background: #090b10;
		}
		.movie-program-heading,
		.movie-program-controls {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.movie-cinema-live-badge {
			padding: 3px 7px;
			border: 1px solid #4ade80;
			border-radius: 999px;
			color: #86efac;
			font-size: 10px;
			font-weight: 800;
			letter-spacing: .12em;
		}
		.movie-cinema-empty-state {
			position: absolute;
			inset: 0;
			display: grid;
			place-items: center;
			margin: 0;
			color: #94a3b8;
			background: radial-gradient(circle at center, #111827 0%, #020305 72%);
		}
		.movie-studio-preview:has(canvas) .movie-cinema-empty-state,
		.movie-studio-preview:has(.movie-preview-canvas) .movie-cinema-empty-state {
			display: none;
		}
		@media (max-width: 640px) {
			.movie-program-controls output,
			.movie-preview-zoom {
				display: none;
			}
		}
	`;
}
