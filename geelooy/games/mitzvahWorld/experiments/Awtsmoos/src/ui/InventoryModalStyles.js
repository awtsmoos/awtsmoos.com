// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file InventoryModalStyles.js
 * @description Gives the Bag one fixed modal plane with reliable touch scrolling and tappable items.
 * The Awtsmoos opens a chamber within the world without confusing its boundaries; Awtsmoos.com
 * lets the list move beneath the hand while every item, action, close button, and context choice answers.
 */
export const INVENTORY_MODAL_CSS = `
html[data-inventory-modal-open="true"],
body[data-inventory-modal-open="true"] {
	overflow: hidden !important;
	overscroll-behavior: none !important;
}
html[data-inventory-modal-open="true"] #joy,
html[data-inventory-modal-open="true"] #jump,
html[data-inventory-modal-open="true"] .Awtsmoos-action-host,
html[data-inventory-modal-open="true"] .Awtsmoos-combat-host-container,
html[data-inventory-modal-open="true"] .Mitzvah-combat-host,
html[data-inventory-modal-open="true"] .Awtsmoos-game-rail {
	visibility: hidden !important;
	pointer-events: none !important;
}
.Awtsmoos-inventory-shell {
	position: fixed !important;
	inset: 0 !important;
	z-index: 980 !important;
	width: 100vw !important;
	height: 100dvh !important;
	padding: 0 !important;
	pointer-events: none !important;
}
.Awtsmoos-inventory-shell[data-modal-active="true"] {
	pointer-events: auto !important;
}
.Awtsmoos-inventory-backdrop {
	position: absolute !important;
	inset: 0 !important;
	z-index: 0 !important;
	background: rgba(0, 4, 10, .82) !important;
	backdrop-filter: blur(6px);
	pointer-events: auto !important;
}
.Awtsmoos-inventory-backdrop[hidden] {
	display: none !important;
}
.Awtsmoos-inventory-panel[data-open="true"] {
	position: fixed !important;
	inset: max(8px, env(safe-area-inset-top, 0px)) max(8px, env(safe-area-inset-right, 0px)) max(8px, env(safe-area-inset-bottom, 0px)) max(8px, env(safe-area-inset-left, 0px)) !important;
	z-index: 1 !important;
	display: grid !important;
	grid-template-rows: auto minmax(0, 1fr) auto !important;
	width: auto !important;
	height: auto !important;
	max-width: none !important;
	max-height: calc(100dvh - 16px) !important;
	margin: 0 !important;
	padding: clamp(10px, 2.5vw, 18px) !important;
	overflow: hidden !important;
	transform: none !important;
	pointer-events: auto !important;
	touch-action: manipulation !important;
}
.Awtsmoos-inventory-panel .inv-header,
.Awtsmoos-inventory-panel .inv-context-menu,
.Awtsmoos-inventory-panel button,
.Awtsmoos-inventory-panel [data-item-id] {
	pointer-events: auto !important;
}
.Awtsmoos-inventory-panel .inv-body {
	min-width: 0 !important;
	min-height: 0 !important;
	overflow-x: hidden !important;
	overflow-y: auto !important;
	overscroll-behavior: contain !important;
	touch-action: pan-y !important;
	-webkit-overflow-scrolling: touch;
	scrollbar-gutter: stable;
}
.Awtsmoos-inventory-panel .item-card[hidden] {
	display: none !important;
}
.Awtsmoos-inventory-panel .inv-context-menu[data-open="true"] {
	position: sticky !important;
	inset: auto 0 0 0 !important;
	z-index: 4 !important;
	display: flex !important;
	gap: 8px !important;
	width: 100% !important;
	max-height: min(26vh, 190px) !important;
	padding: 10px !important;
	overflow-y: auto !important;
	background: rgba(4, 10, 18, .98) !important;
	overscroll-behavior: contain !important;
	touch-action: pan-x pan-y !important;
}
@media (max-width: 820px), (max-height: 520px) {
	.Awtsmoos-inventory-panel .inv-body {
		display: block !important;
		padding-bottom: 18px !important;
	}
	.Awtsmoos-inventory-panel .equip-grid,
	.Awtsmoos-inventory-panel .bag-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
	}
	.Awtsmoos-inventory-panel .item-card {
		min-height: 86px !important;
	}
}
`;
export function installInventoryModalStyles(documentValue) {
	const id = 'Awtsmoos-inventory-modal-styles';
	if (documentValue.getElementById(id)) return;
	const style = documentValue.createElement('style');
	style.id = id;
	style.textContent = INVENTORY_MODAL_CSS;
	documentValue.head.append(style);
}
