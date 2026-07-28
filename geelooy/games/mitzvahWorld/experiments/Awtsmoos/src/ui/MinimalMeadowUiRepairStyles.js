// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUiRepairStyles.js
 * @description Installs the final safe-viewport authority without contradicting portrait owners.
 * The Awtsmoos gives every sheet and control a measured shore; Awtsmoos.com leaves portrait
 * placement to its dedicated modules while menus, Bag, and landscape remain bounded and touchable.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-ui-repair';

export function installMinimalMeadowUiRepairStyles(documentValue = globalThis.document) {
	if (!documentValue?.head || documentValue.getElementById(STYLE_ID)) return false;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = UI_REPAIR_CSS;
	documentValue.head.appendChild(style);
	documentValue.documentElement.dataset.awtsmoosHudRepair = 'safe-viewport-v3';
	return true;
}

export const UI_REPAIR_CSS = `
:root {
	--Awtsmoos-safe-top: calc(env(safe-area-inset-top) + 8px);
	--Awtsmoos-safe-right: calc(env(safe-area-inset-right) + 8px);
	--Awtsmoos-safe-bottom: calc(env(safe-area-inset-bottom) + 8px);
	--Awtsmoos-safe-left: calc(env(safe-area-inset-left) + 8px);
}
.Awtsmoos-gameplay *,
.Awtsmoos-meadow-menu *,
.Awtsmoos-inventory-panel * {
	box-sizing: border-box;
}
.Awtsmoos-sheet,
.Awtsmoos-quest-log,
.Awtsmoos-torah-library {
	max-width: calc(100vw - var(--Awtsmoos-safe-left) - var(--Awtsmoos-safe-right)) !important;
	max-height: calc(100dvh - var(--Awtsmoos-safe-top) - var(--Awtsmoos-safe-bottom)) !important;
}
.Awtsmoos-meadow-menu {
	position: fixed;
	inset: 0;
	z-index: 930;
	pointer-events: none;
}
.Awtsmoos-meadow-menu[data-open="true"] {
	background: rgba(0, 0, 0, .58);
	pointer-events: auto;
}
.Awtsmoos-meadow-menu > section {
	position: absolute;
	top: 50%;
	left: 50%;
	width: min(680px, calc(100vw - 24px));
	max-height: min(82dvh, 760px);
	overflow: auto;
	transform: translate(-50%, -50%);
}
.Awtsmoos-inventory-panel[data-open="true"] {
	max-width: none !important;
	max-height: none !important;
}
@media (max-width: 820px), (pointer: coarse) {
	.Awtsmoos-meadow-menu > section {
		inset: auto var(--Awtsmoos-safe-right) var(--Awtsmoos-safe-bottom) var(--Awtsmoos-safe-left);
		width: auto;
		max-height: min(78dvh, 720px);
		border-radius: 18px;
		transform: none;
	}
	body .Awtsmoos-cast-meter,
	body .Mitzvah-castbar {
		box-sizing: border-box !important;
		max-width: calc(100vw - 104px) !important;
	}
}
@media (orientation: landscape) and (max-height: 520px) {
	body .Awtsmoos-status-dock {
		width: clamp(180px, 25vw, 260px) !important;
		max-height: 74px !important;
	}
	body .Awtsmoos-target-frame {
		inset: var(--Awtsmoos-safe-top) var(--Awtsmoos-safe-right) auto auto !important;
		width: clamp(180px, 27vw, 310px) !important;
		max-height: 76px !important;
	}
	body .Awtsmoos-quest-tracker {
		inset: calc(var(--Awtsmoos-safe-top) + 82px) auto auto var(--Awtsmoos-safe-left) !important;
		width: clamp(210px, 31vw, 340px) !important;
		max-height: 92px !important;
	}
}
`;
