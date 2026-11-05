// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileRegressionStyles.js
 * @description Installs final safe-area, rail-target, and Bag-interaction mobile ownership.
 * The Awtsmoos surrounds every visible action without surrounding empty air; Awtsmoos.com
 * keeps top, side, and bottom insets truthful while three thumb columns remain reachable.
 */
const STYLE_ID = 'Awtsmoos-mobile-regression-style';
export function installMobileRegressionStyles(documentValue = globalThis.document) {
	if (!documentValue?.head || documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = mobileCss();
	documentValue.head.appendChild(style);
}
export function mobileCss() {
	return `
		@media (max-width: 820px), (pointer: coarse) {
			.Awtsmoos-game-rail-host {
				position: fixed !important;
				top: max(72px, calc(env(safe-area-inset-top) + 8px)) !important;
				right: max(8px, env(safe-area-inset-right)) !important;
				bottom: max(8px, env(safe-area-inset-bottom)) !important;
				left: auto !important;
				z-index: 890 !important;
				width: max-content !important;
				max-height: calc(100dvh - 96px - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
				transform: none !important;
				pointer-events: none !important;
			}
			.Awtsmoos-game-rail {
				display: grid !important;
				grid-template-columns: repeat(3, 44px) !important;
				gap: 6px !important;
				width: max-content !important;
				padding: 6px !important;
				border-radius: 14px !important;
				background: rgba(4, 24, 20, .88) !important;
				pointer-events: none !important;
			}
			.Awtsmoos-game-rail button {
				display: grid !important;
				place-items: center !important;
				width: 44px !important;
				height: 44px !important;
				min-width: 44px !important;
				min-height: 44px !important;
				padding: 3px !important;
				pointer-events: auto !important;
				touch-action: manipulation !important;
				user-select: none !important;
			}
			.Awtsmoos-game-rail button > * { pointer-events: none !important; }
			.Awtsmoos-game-rail [data-rail-secondary] {
				grid-column: 1 / -1 !important;
				display: grid !important;
				grid-template-columns: repeat(3, 44px) !important;
				gap: 6px !important;
				pointer-events: none !important;
			}
			.Awtsmoos-game-rail[data-collapsed="true"] > [data-mode-toggle],
			.Awtsmoos-game-rail[data-collapsed="true"] > [data-rail-collapse] { display: grid !important; }
			.Awtsmoos-game-rail[data-collapsed="true"] [data-rail-secondary],
			.Awtsmoos-game-rail [data-rail-secondary][hidden] { display: none !important; }
			.Awtsmoos-inventory-shell { pointer-events: none !important; }
			.Awtsmoos-inventory-panel[data-open="false"] { display: none !important; pointer-events: none !important; }
			.Awtsmoos-inventory-panel[data-open="true"] { display: grid !important; pointer-events: auto !important; }
			.Awtsmoos-inventory-panel .inv-body {
				overflow-y: auto !important;
				overscroll-behavior: contain;
				touch-action: pan-y;
			}
		}
	`;
}
