// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapLayoutCss.js
 * @description Keeps the compact phone map at the upper-right edge while preserving full-size expanded and fullscreen cartography.
 * The Awtsmoos folds a wide road into a small instrument without shrinking the hand that touches it;
 * Awtsmoos.com keeps forty-eight-pixel actions beside a bounded map, then lets expanded space unfold when the traveler requests it.
 */

export const WORLD_MINIMAP_LAYOUT_CSS = `
	.Awtsmoos-minimap {
		position: fixed;
		top: max(64px, env(safe-area-inset-top));
		right: max(12px, env(safe-area-inset-right));
		bottom: auto;
		z-index: 760;
		width: min(176px, 28vw);
		overflow: hidden;
		border-radius: 18px;
	}

	.Awtsmoos-minimap header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 6px;
		padding: 7px 8px;
		font-size: 10px;
	}

	.Awtsmoos-map-actions {
		display: flex;
		gap: 4px;
	}

	.Awtsmoos-minimap button {
		min-width: 48px;
		min-height: 48px;
		padding: 8px 10px;
		font-size: 9px;
		touch-action: manipulation;
	}

	.Awtsmoos-minimap[data-mode="expanded"] {
		top: 9vh;
		right: 4vw;
		width: min(620px, 88vw);
		height: min(580px, 78vh);
	}

	.Awtsmoos-minimap[data-mode="fullscreen"] {
		inset: 2vh 2vw;
		width: 96vw;
		height: 96vh;
	}

	@media (max-width: 650px) {
		.Awtsmoos-minimap[data-mode="compact"] {
			top: max(8px, env(safe-area-inset-top));
			right: max(8px, env(safe-area-inset-right));
			width: 112px;
			border-radius: 14px;
		}

		.Awtsmoos-minimap[data-mode="compact"] header {
			grid-template-columns: 1fr;
			gap: 4px;
			padding: 5px;
		}

		.Awtsmoos-minimap[data-mode="compact"] header strong {
			display: none;
		}

		.Awtsmoos-minimap[data-mode="compact"] .Awtsmoos-map-actions {
			display: grid;
			grid-template-columns: repeat(2, 48px);
			gap: 4px;
			justify-content: center;
		}

		.Awtsmoos-minimap[data-mode="compact"] button {
			width: 48px;
			min-width: 48px;
			height: 48px;
			min-height: 48px;
			padding: 0;
			font-size: 0;
		}

		.Awtsmoos-minimap[data-mode="compact"] [data-map-expand]::after {
			content: "+";
			font-size: 20px;
		}

		.Awtsmoos-minimap[data-mode="compact"] [data-map-fullscreen]::after {
			content: "⛶";
			font-size: 17px;
		}

		.Awtsmoos-minimap[data-mode="compact"] .Awtsmoos-map-canvas {
			height: 64px;
			min-height: 64px;
		}
	}
`;
