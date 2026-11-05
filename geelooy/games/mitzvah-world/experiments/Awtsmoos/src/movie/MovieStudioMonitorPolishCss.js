// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMonitorPolishCss.js
 * @description Polishes program metadata, preview staging, frame containment, and guides.
 * The Awtsmoos renews every frame before the eye can name it; Awtsmoos.com gives
 * the world a precise black mirror whose controls never distort or cover its light.
 */

export function movieStudioMonitorPolishCss() {
	return `
		.movie-studio-preview-column {
			grid-template-rows: auto minmax(0, 1fr) auto auto;
			background:
				linear-gradient(45deg, #070b11 25%, transparent 25%) 0 0 / 18px 18px,
				linear-gradient(-45deg, #070b11 25%, transparent 25%) 0 0 / 18px 18px,
				linear-gradient(45deg, transparent 75%, #070b11 75%) 0 0 / 18px 18px,
				linear-gradient(-45deg, transparent 75%, #070b11 75%) 0 0 / 18px 18px,
				var(--movie-surface-canvas);
		}
		.movie-program-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-3);
			min-height: var(--movie-program-header-height);
			padding: var(--movie-space-1) var(--movie-space-3);
			border-bottom: 1px solid var(--movie-divider-subtle);
			background: rgb(7 12 18 / .96);
		}
		.movie-program-heading {
			display: flex;
			align-items: baseline;
			gap: var(--movie-space-2);
			min-width: 0;
		}
		.movie-program-heading span {
			color: var(--movie-accent);
			font-size: 10px;
			font-weight: 800;
			letter-spacing: .12em;
			text-transform: uppercase;
		}
		.movie-program-heading strong {
			overflow: hidden;
			color: var(--movie-text-muted);
			font-size: 11px;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.movie-program-controls {
			display: flex;
			align-items: center;
			gap: var(--movie-space-2);
		}
		.movie-program-controls output {
			padding: 4px 8px;
			border: 1px solid var(--movie-divider-subtle);
			border-radius: 999px;
			color: var(--movie-text-muted);
			font: 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
		}
		.movie-preview-zoom select {
			min-height: 28px;
			padding-inline: 7px;
			font-size: 11px;
		}
		.movie-studio-preview-stage {
			display: grid;
			place-items: center;
			min-width: 0;
			min-height: 0;
			padding: clamp(8px, 2vw, 24px);
			overflow: hidden;
		}
		.movie-studio-preview-frame {
			position: relative;
			display: grid;
			place-items: center;
			width: min(100%, calc((100dvh - 260px) * var(--movie-project-aspect, 1.7778)));
			max-height: 100%;
			aspect-ratio: var(--movie-project-aspect, 16 / 9);
			overflow: hidden;
			border: 1px solid var(--movie-border-strong);
			border-radius: var(--movie-radius-lg);
			background: #000;
			box-shadow: 0 0 0 1px rgb(255 255 255 / .03), var(--movie-shadow-lg);
		}
		.movie-studio-preview-frame canvas {
			display: block;
			width: 100% !important;
			height: 100% !important;
			max-width: 100%;
			max-height: 100%;
			object-fit: contain;
		}
		.movie-preview-overlay {
			position: absolute;
			inset: 0;
			pointer-events: none;
		}
	`;
}
