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
			.Awtsmoos-game-rail-host.Awtsmoos-game-rail-host {
				position: fixed;
				top: max(72px, calc(env(safe-area-inset-top) + 8px));
				right: max(8px, env(safe-area-inset-right));
				bottom: max(8px, env(safe-area-inset-bottom));
				left: auto;
				z-index: 890;
				width: max-content;
				max-height: calc(100dvh - 96px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
				transform: none;
				pointer-events: none;
			}
			.Awtsmoos-game-rail.Awtsmoos-game-rail {
				display: grid;
				grid-template-columns: repeat(3, 44px);
				gap: 6px;
				width: max-content;
				padding: 6px;
				border-radius: 14px;
				background: rgba(4, 24, 20, .88);
				pointer-events: none;
			}
			.Awtsmoos-game-rail.Awtsmoos-game-rail button {
				display: grid;
				place-items: center;
				width: 44px;
				height: 44px;
				min-width: 44px;
				min-height: 44px;
				padding: 3px;
				pointer-events: auto;
				touch-action: manipulation;
				user-select: none;
			}
			.Awtsmoos-game-rail.Awtsmoos-game-rail button > * { pointer-events: none; }
			.Awtsmoos-game-rail.Awtsmoos-game-rail [data-rail-secondary][data-rail-secondary] {
				grid-column: 1 / -1;
				display: grid;
				grid-template-columns: repeat(3, 44px);
				gap: 6px;
				pointer-events: none;
			}
			.Awtsmoos-game-rail.Awtsmoos-game-rail[data-collapsed="true"] > [data-mode-toggle][data-mode-toggle],
			.Awtsmoos-game-rail.Awtsmoos-game-rail[data-collapsed="true"] > [data-rail-collapse][data-rail-collapse] { display: grid; }
			.Awtsmoos-game-rail.Awtsmoos-game-rail[data-collapsed="true"] [data-rail-secondary][data-rail-secondary],
			.Awtsmoos-game-rail.Awtsmoos-game-rail [data-rail-secondary][data-rail-secondary][hidden][hidden] { display: none; }
			.Awtsmoos-inventory-shell.Awtsmoos-inventory-shell { pointer-events: none; }
			.Awtsmoos-inventory-panel.Awtsmoos-inventory-panel[data-open="false"] { display: none; pointer-events: none; }
			.Awtsmoos-inventory-panel.Awtsmoos-inventory-panel[data-open="true"] { display: grid; pointer-events: auto; }
			.Awtsmoos-inventory-panel.Awtsmoos-inventory-panel .inv-body.inv-body {
				overflow-y: auto;
				overscroll-behavior: contain;
				touch-action: pan-y;
			}
		}
	`;
}
