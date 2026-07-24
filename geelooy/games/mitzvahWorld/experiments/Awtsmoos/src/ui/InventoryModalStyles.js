// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalStyles.js
 * @description Makes the Bag a safe-area dialog and removes exposed world controls beneath it.
 * The Awtsmoos surrounds the world while a finite chamber receives full attention;
 * Awtsmoos.com lets details scroll inside the Bag without leaving action buttons alive below it.
 */

export const INVENTORY_MODAL_CSS = `
html[data-inventory-modal-open="true"],
body[data-inventory-modal-open="true"] {
	overflow: hidden !important;
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
.Awtsmoos-inventory-shell[data-modal-active="true"] {
	inset: 0 !important;
	z-index: 980 !important;
	padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px)
		env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px) !important;
	pointer-events: auto !important;
}
.Awtsmoos-inventory-backdrop {
	position: absolute;
	inset: 0;
	background: rgba(0, 4, 10, 0.78);
	backdrop-filter: blur(5px);
	pointer-events: auto;
}
.Awtsmoos-inventory-backdrop[hidden] {
	display: none;
}
.Awtsmoos-inventory-panel[data-open="true"] {
	z-index: 1;
	max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px);
}
.Awtsmoos-inventory-panel .item-card[hidden] {
	display: none !important;
}
.Awtsmoos-inventory-panel .item-card[data-has-selection="true"] {
	max-height: min(26vh, 190px);
	overflow-y: auto;
	overscroll-behavior: contain;
	touch-action: pan-y;
}
.Awtsmoos-inventory-panel .inv-context-menu[data-open="true"] {
	max-height: min(30vh, 220px);
	overflow-y: auto;
	overscroll-behavior: contain;
}
@media (max-width: 820px), (max-height: 520px) {
	.Awtsmoos-inventory-panel[data-open="true"] {
		position: relative !important;
		inset: auto !important;
		display: grid !important;
		grid-template-rows: auto minmax(0, 1fr) auto !important;
		width: 100% !important;
		height: 100% !important;
		max-width: none !important;
		max-height: none !important;
		padding: 10px !important;
		transform: none !important;
		overflow: hidden !important;
	}
	.Awtsmoos-inventory-panel .inv-body {
		grid-template-columns: 1fr !important;
		grid-template-rows: auto minmax(0, 1fr) !important;
		gap: 8px !important;
		overflow-y: auto !important;
	}
	.Awtsmoos-inventory-panel .equip-grid,
	.Awtsmoos-inventory-panel .bag-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
	}
	.Awtsmoos-inventory-panel .inv-context-menu[data-open="true"] {
		position: static !important;
		width: auto !important;
		margin-top: 8px;
	}
}
`;

export function installInventoryModalStyles(documentValue) {
	const id = 'Awtsmoos-inventory-modal-styles';
	if (documentValue.getElementById(id)) {
		return;
	}
	const style = documentValue.createElement('style');
	style.id = id;
	style.textContent = INVENTORY_MODAL_CSS;
	documentValue.head.append(style);
}
