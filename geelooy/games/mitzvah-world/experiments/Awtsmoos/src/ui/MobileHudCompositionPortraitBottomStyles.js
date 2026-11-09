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
	body .Awtsmoos-action-host.Awtsmoos-action-host,
	body .Awtsmoos-combat-host.Awtsmoos-combat-host {
		position: fixed;
		inset: auto var(--Awtsmoos-hud-rail-reserve) calc(var(--Awtsmoos-hud-safe-bottom) + 8px) var(--Awtsmoos-hud-side);
		width: auto;
		max-width: none;
		margin: 0;
		transform: none;
		z-index: 830;
	}
	body .Mitzvah-combat-host.Mitzvah-combat-host {
		position: fixed;
		inset: auto var(--Awtsmoos-hud-rail-reserve) calc(var(--Awtsmoos-hud-safe-bottom) + 132px) var(--Awtsmoos-hud-side);
		width: auto;
		max-width: none;
		max-height: 122px;
		margin: 0;
		overflow: hidden;
		transform: none;
		z-index: 828;
	}
	body .Awtsmoos-cast-meter.Awtsmoos-cast-meter,
	body .Mitzvah-castbar.Mitzvah-castbar {
		position: fixed;
		inset: auto var(--Awtsmoos-hud-rail-reserve) calc(var(--Awtsmoos-hud-safe-bottom) + 86px) var(--Awtsmoos-hud-side);
		box-sizing: border-box;
		width: auto;
		min-width: 0;
		max-width: none;
		max-height: 56px;
		margin: 0;
		overflow: hidden;
		transform: none;
		z-index: 836;
	}
	body .Awtsmoos-cast-meter.Awtsmoos-cast-meter header,
	body .Mitzvah-castbar.Mitzvah-castbar header {
		min-width: 0;
		overflow: hidden;
	}
	body .Awtsmoos-cast-meter.Awtsmoos-cast-meter strong,
	body .Mitzvah-castbar.Mitzvah-castbar strong {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	body .Mitzvah-status-effects.Mitzvah-status-effects {
		position: fixed;
		inset: auto var(--Awtsmoos-hud-rail-reserve) calc(var(--Awtsmoos-hud-safe-bottom) + 262px) var(--Awtsmoos-hud-side);
		width: auto;
		max-height: 32px;
		overflow: hidden;
		transform: none;
	}
	body [data-awtsmoos-minimized="true"][data-awtsmoos-minimized="true"] > :not(.Awtsmoos-hud-minimize) {
		display: none;
	}
`;
