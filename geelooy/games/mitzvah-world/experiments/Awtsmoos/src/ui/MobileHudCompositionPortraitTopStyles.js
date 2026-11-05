// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionPortraitTopStyles.js
 * @description Gives player, target, quest, notice, and rail separate portrait rectangles.
 * The Awtsmoos draws one boundary around every finite card; Awtsmoos.com prevents a selected
 * face from being pushed beyond the glass while names, levels, and bars remain wholly visible.
 */

export const MOBILE_HUD_PORTRAIT_TOP_CSS = `
	:root {
		--Awtsmoos-hud-safe-bottom: max(8px, env(safe-area-inset-bottom, 0px));
		--Awtsmoos-hud-side: max(10px, env(safe-area-inset-left, 0px));
		--Awtsmoos-hud-rail-reserve: 82px;
		--Awtsmoos-hud-card-width: min(360px, calc(100vw - 104px));
	}
	body .Awtsmoos-status-dock {
		position: fixed !important;
		top: calc(env(safe-area-inset-top) + 8px) !important;
		right: auto !important;
		bottom: auto !important;
		left: var(--Awtsmoos-hud-side) !important;
		width: var(--Awtsmoos-hud-card-width) !important;
		max-width: calc(100vw - var(--Awtsmoos-hud-side) - 10px) !important;
		max-height: 132px !important;
		margin: 0 !important;
		overflow: hidden !important;
		transform: none !important;
		z-index: 824 !important;
	}
	body .Awtsmoos-target-frame {
		position: fixed !important;
		top: calc(env(safe-area-inset-top) + 142px) !important;
		right: auto !important;
		bottom: auto !important;
		left: var(--Awtsmoos-hud-side) !important;
		width: var(--Awtsmoos-hud-card-width) !important;
		min-width: 0 !important;
		max-width: calc(100vw - var(--Awtsmoos-hud-side) - var(--Awtsmoos-hud-rail-reserve)) !important;
		max-height: 90px !important;
		margin: 0 !important;
		overflow: hidden !important;
		transform: none !important;
		z-index: 823 !important;
	}
	body .Awtsmoos-target-frame > *,
	body .Awtsmoos-target-frame section {
		width: 100% !important;
		min-width: 0 !important;
		max-width: 100% !important;
		max-height: 90px !important;
		overflow: hidden !important;
	}
	body .Awtsmoos-target-frame .Awtsmoos-target-details {
		display: none !important;
	}
	body .Awtsmoos-status-ribbon {
		position: fixed !important;
		top: calc(env(safe-area-inset-top) + 238px) !important;
		right: auto !important;
		left: var(--Awtsmoos-hud-side) !important;
		width: var(--Awtsmoos-hud-card-width) !important;
		max-height: 36px !important;
		overflow: hidden !important;
		z-index: 822 !important;
	}
	body .Awtsmoos-quest-tracker {
		position: fixed !important;
		top: calc(env(safe-area-inset-top) + 282px) !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		left: var(--Awtsmoos-hud-side) !important;
		width: auto !important;
		max-height: 102px !important;
		overflow: auto !important;
		overscroll-behavior: contain;
		z-index: 818 !important;
	}
	body .Awtsmoos-quest-tracker .Awtsmoos-tracked-quest:nth-of-type(n + 2) {
		display: none !important;
	}
	body .Awtsmoos-house-notice {
		position: fixed !important;
		top: calc(env(safe-area-inset-top) + 392px) !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		left: var(--Awtsmoos-hud-side) !important;
		width: auto !important;
		max-height: 92px !important;
		overflow: hidden !important;
		z-index: 824 !important;
	}
`;
