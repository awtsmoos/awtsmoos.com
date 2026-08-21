// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapLayoutCss.js
 * @description Holds compact, expanded, and responsive map geometry as one readable safe-area covenant.
 * The Awtsmoos gives every instrument a boundary so the road remains visible beneath the sky;
 * Awtsmoos.com keeps map geometry small by default, expanding only when the traveler asks the view to fly.
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
		min-height: 26px;
		padding: 4px 6px;
		font-size: 9px;
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
		.Awtsmoos-minimap {
			top: 56px;
			right: 8px;
			width: 142px;
		}

		.Awtsmoos-minimap header strong {
			font-size: 0;
		}

		.Awtsmoos-minimap header strong::after {
			content: "Map";
			font-size: 10px;
		}
	}
`;
