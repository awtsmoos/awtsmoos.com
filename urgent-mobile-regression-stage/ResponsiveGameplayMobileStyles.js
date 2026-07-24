//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ResponsiveGameplayMobileStyles.js
 * @description Keeps the 390×844 HUD and Bag inside real mobile safe areas.
 * The Awtsmoos surrounds every narrow screen without hiding the player;
 * Awtsmoos.com gives joystick, jump, target, Bag, and action bar separate space.
 */

export function responsiveMobileCss() {
	return `
		@media (max-width: 700px), (pointer: coarse) {
			.Awtsmoos-sheet {
				top: max(8px, env(safe-area-inset-top));
				right: max(8px, env(safe-area-inset-right));
				bottom: max(72px, env(safe-area-inset-bottom));
				left: max(8px, env(safe-area-inset-left));
				width: auto;
				max-height: none;
				padding: 10px;
				border-radius: 14px;
			}
			.Awtsmoos-profile-summary,
			.Awtsmoos-derived-grid {
				grid-template-columns: repeat(2, 1fr);
			}
			.Awtsmoos-game-rail-host {
				position: fixed !important;
				top: max(72px, calc(env(safe-area-inset-top) + 8px)) !important;
				right: max(8px, env(safe-area-inset-right)) !important;
				left: auto !important;
				bottom: auto !important;
				z-index: 760 !important;
				width: auto !important;
				pointer-events: none;
			}
			.Awtsmoos-game-rail {
				display: grid !important;
				grid-template-columns: 56px 44px;
				gap: 6px;
				width: auto !important;
				max-width: calc(100vw - 16px);
				padding: 6px !important;
				border: 1px solid rgba(125, 190, 158, .38);
				border-radius: 14px;
				background: rgba(4, 24, 20, .88) !important;
				backdrop-filter: blur(8px);
				pointer-events: auto;
			}
			.Awtsmoos-game-rail button {
				min-width: 44px !important;
				min-height: 44px !important;
				padding: 4px !important;
			}
			.Awtsmoos-game-rail [data-rail-secondary] {
				grid-column: 1 / -1;
				display: grid;
				grid-template-columns: repeat(4, minmax(44px, 1fr));
				gap: 5px;
				max-width: min(304px, calc(100vw - 28px));
			}
			.Awtsmoos-game-rail[data-collapsed="true"] [data-rail-secondary],
			.Awtsmoos-game-rail [data-rail-secondary][hidden] {
				display: none !important;
			}
			.Awtsmoos-inventory-panel {
				position: fixed !important;
				inset: max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(72px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left)) !important;
				z-index: 930 !important;
				display: grid !important;
				grid-template-rows: auto minmax(0, 1fr) auto;
				width: auto !important;
				height: auto !important;
				max-height: none !important;
				overflow: hidden !important;
				border-radius: 14px !important;
			}
			.Awtsmoos-inventory-panel[data-open="false"] {
				display: none !important;
			}
			.Awtsmoos-inventory-panel > header {
				position: sticky;
				top: 0;
				z-index: 3;
				min-height: 52px;
				background: rgba(5, 20, 17, .98);
			}
			.Awtsmoos-inventory-panel .inv-body {
				display: grid !important;
				grid-template-columns: 1fr !important;
				gap: 10px;
				min-height: 0;
				overflow: auto !important;
				overscroll-behavior: contain;
			}
			.Awtsmoos-inventory-panel .equip-grid,
			.Awtsmoos-inventory-panel .bag-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
				gap: 7px;
			}
			.Awtsmoos-inventory-panel .item-card {
				min-height: 96px;
				max-height: 34vh;
				overflow: auto;
			}
			.Awtsmoos-inventory-panel .bag-empty {
				grid-column: 1 / -1;
				padding: 18px 10px;
				text-align: center;
				color: #b9c9c2;
			}
		}
	`;
}
