// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionLandscapeStyles.js
 * @description Places every compact HUD zone in a measured horizontal landscape sequence.
 * The Awtsmoos renews breadth and height with equal truth;
 * Awtsmoos.com turns landscape scarcity into ordered bands rather than unreadable shrinkage.
 */

export const MOBILE_HUD_LANDSCAPE_CSS = `
@media (orientation: landscape) and (max-height: 520px) {
	:root {
		--Awtsmoos-hud-safe-top: env(safe-area-inset-top, 0px);
		--Awtsmoos-hud-safe-bottom: env(safe-area-inset-bottom, 0px);
		--Awtsmoos-hud-rail-reserve: 72px;
	}
	.Awtsmoos-status-dock {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 8px) !important;
		left: 8px !important;
		width: 210px !important;
		max-height: 44px !important;
		overflow: hidden !important;
	}
	.Awtsmoos-status-ribbon {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 56px) !important;
		left: 8px !important;
		width: 210px !important;
		max-height: 24px !important;
		overflow: hidden !important;
	}
	.Awtsmoos-quest-tracker {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 8px) !important;
		left: 226px !important;
		width: 260px !important;
		max-height: 72px !important;
		overflow: hidden !important;
	}
	.Awtsmoos-quest-tracker .Awtsmoos-tracked-quest:nth-of-type(n + 2) {
		display: none !important;
	}
	.Awtsmoos-target-frame {
		top: calc(var(--Awtsmoos-hud-safe-top) + 8px) !important;
		left: 494px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		width: auto !important;
		min-width: 0 !important;
		max-height: 72px !important;
		transform: none !important;
	}
	.Awtsmoos-target-frame section {
		display: block !important;
		max-height: 72px !important;
		overflow: hidden !important;
	}
	.Awtsmoos-target-details {
		display: none !important;
	}
	.Awtsmoos-house-notice {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 88px) !important;
		left: 8px !important;
		width: 478px !important;
		max-height: 64px !important;
		overflow: hidden !important;
	}
	.Mitzvah-status-effects {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 160px) !important;
		left: 170px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		bottom: auto !important;
		width: auto !important;
		max-height: 30px !important;
		overflow: hidden !important;
		transform: none !important;
	}
	.Mitzvah-combat-host {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 194px) !important;
		left: 170px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		bottom: auto !important;
		max-height: 52px !important;
		overflow: hidden !important;
	}
	.Awtsmoos-cast-meter,
	.Mitzvah-castbar {
		position: fixed !important;
		left: 170px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		bottom: calc(var(--Awtsmoos-hud-safe-bottom) + 78px) !important;
		width: auto !important;
		max-width: none !important;
		max-height: 36px !important;
		transform: none !important;
	}
	.Awtsmoos-combat-host,
	.Awtsmoos-action-host {
		position: fixed !important;
		left: 170px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		bottom: calc(var(--Awtsmoos-hud-safe-bottom) + 8px) !important;
		width: auto !important;
		max-width: none !important;
	}
	[data-awtsmoos-minimized="true"] > :not(.Awtsmoos-hud-minimize) {
		display: none !important;
	}
}
`;
