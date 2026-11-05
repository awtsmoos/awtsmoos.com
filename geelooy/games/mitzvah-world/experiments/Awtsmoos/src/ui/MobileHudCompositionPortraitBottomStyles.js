// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionPortraitBottomStyles.js
 * @description Gives action controls, cast progress, effects, and feedback one safe portrait lane.
 * The Awtsmoos measures preparation before deed; Awtsmoos.com keeps every casting word inside
 * the glass while the rail, joystick, jump button, and mobile browser shore remain untouched.
 */

export const MOBILE_HUD_PORTRAIT_BOTTOM_CSS = `
	body .Awtsmoos-action-host,
	body .Awtsmoos-combat-host {
		position: fixed !important;
		inset: auto var(--Awtsmoos-hud-rail-reserve) calc(var(--Awtsmoos-hud-safe-bottom) + 8px) var(--Awtsmoos-hud-side) !important;
		width: auto !important;
		max-width: none !important;
		margin: 0 !important;
		transform: none !important;
		z-index: 830 !important;
	}
	body .Mitzvah-combat-host {
		position: fixed !important;
		inset: auto var(--Awtsmoos-hud-rail-reserve) calc(var(--Awtsmoos-hud-safe-bottom) + 132px) var(--Awtsmoos-hud-side) !important;
		width: auto !important;
		max-width: none !important;
		max-height: 122px !important;
		margin: 0 !important;
		overflow: hidden !important;
		transform: none !important;
		z-index: 828 !important;
	}
	body .Awtsmoos-cast-meter,
	body .Mitzvah-castbar {
		position: fixed !important;
		inset: auto var(--Awtsmoos-hud-rail-reserve) calc(var(--Awtsmoos-hud-safe-bottom) + 86px) var(--Awtsmoos-hud-side) !important;
		box-sizing: border-box !important;
		width: auto !important;
		min-width: 0 !important;
		max-width: none !important;
		max-height: 56px !important;
		margin: 0 !important;
		overflow: hidden !important;
		transform: none !important;
		z-index: 836 !important;
	}
	body .Awtsmoos-cast-meter header,
	body .Mitzvah-castbar header {
		min-width: 0 !important;
		overflow: hidden !important;
	}
	body .Awtsmoos-cast-meter strong,
	body .Mitzvah-castbar strong {
		min-width: 0 !important;
		overflow: hidden !important;
		text-overflow: ellipsis !important;
		white-space: nowrap !important;
	}
	body .Mitzvah-status-effects {
		position: fixed !important;
		inset: auto var(--Awtsmoos-hud-rail-reserve) calc(var(--Awtsmoos-hud-safe-bottom) + 262px) var(--Awtsmoos-hud-side) !important;
		width: auto !important;
		max-height: 32px !important;
		overflow: hidden !important;
		transform: none !important;
	}
	body [data-awtsmoos-minimized="true"] > :not(.Awtsmoos-hud-minimize) {
		display: none !important;
	}
`;
