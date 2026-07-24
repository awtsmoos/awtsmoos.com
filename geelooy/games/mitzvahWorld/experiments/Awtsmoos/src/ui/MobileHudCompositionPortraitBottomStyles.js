// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionPortraitBottomStyles.js
 * @description Reserves portrait bands for effects, combat detail, cast, and action controls.
 * The Awtsmoos orders potential, preparation, and deed without collision;
 * Awtsmoos.com keeps every combat word above the buttons that must remain touchable.
 */

export const MOBILE_HUD_PORTRAIT_BOTTOM_CSS = `
	.Awtsmoos-combat-host,
	.Awtsmoos-action-host {
		position: fixed !important;
		left: 8px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		bottom: calc(var(--Awtsmoos-hud-safe-bottom) + 8px) !important;
		width: auto !important;
		max-width: none !important;
		z-index: 830 !important;
	}
	.Mitzvah-combat-host {
		position: fixed !important;
		left: 8px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		bottom: calc(var(--Awtsmoos-hud-safe-bottom) + 130px) !important;
		max-height: 120px !important;
		overflow: hidden !important;
		z-index: 828 !important;
	}
	.Awtsmoos-cast-meter,
	.Mitzvah-castbar {
		position: fixed !important;
		left: 8px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		bottom: calc(var(--Awtsmoos-hud-safe-bottom) + 84px) !important;
		width: auto !important;
		max-width: none !important;
		max-height: 38px !important;
		transform: none !important;
		z-index: 836 !important;
	}
	.Mitzvah-status-effects {
		position: fixed !important;
		left: 8px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		bottom: calc(var(--Awtsmoos-hud-safe-bottom) + 258px) !important;
		width: auto !important;
		max-height: 30px !important;
		overflow: hidden !important;
		transform: none !important;
	}
	[data-awtsmoos-minimized="true"] > :not(.Awtsmoos-hud-minimize) {
		display: none !important;
	}
`;
