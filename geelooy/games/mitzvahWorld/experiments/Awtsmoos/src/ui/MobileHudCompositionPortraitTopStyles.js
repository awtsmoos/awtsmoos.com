// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionPortraitTopStyles.js
 * @description Reserves portrait top zones for player, target, quest, transient, and right rail.
 * The Awtsmoos gives every upper vessel a readable shore;
 * Awtsmoos.com prevents target and loot speech from trespassing upon quest or rail.
 */

export const MOBILE_HUD_PORTRAIT_TOP_CSS = `
	:root {
		--Awtsmoos-hud-safe-top: env(safe-area-inset-top, 0px);
		--Awtsmoos-hud-safe-bottom: env(safe-area-inset-bottom, 0px);
		--Awtsmoos-hud-rail-reserve: 72px;
	}
	.Awtsmoos-status-dock {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 8px) !important;
		left: 8px !important;
		width: min(42vw, 164px) !important;
		max-height: 58px !important;
		overflow: hidden !important;
		z-index: 820 !important;
	}
	.Awtsmoos-status-ribbon {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 72px) !important;
		left: 8px !important;
		width: min(42vw, 164px) !important;
		max-height: 34px !important;
		overflow: hidden !important;
		z-index: 820 !important;
	}
	.Awtsmoos-target-frame {
		top: calc(var(--Awtsmoos-hud-safe-top) + 8px) !important;
		left: calc(min(42vw, 164px) + 16px) !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		width: auto !important;
		min-width: 0 !important;
		max-height: 96px !important;
		transform: none !important;
	}
	.Awtsmoos-target-frame section {
		max-height: 96px !important;
		overflow: hidden !important;
	}
	.Awtsmoos-target-frame[data-collapsed="true"] section {
		display: block !important;
	}
	.Awtsmoos-target-frame[data-collapsed="true"] .Awtsmoos-target-details {
		display: none !important;
	}
	.Awtsmoos-quest-tracker {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 114px) !important;
		left: 8px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		width: auto !important;
		max-height: 84px !important;
		overflow: hidden !important;
		z-index: 818 !important;
	}
	.Awtsmoos-quest-tracker .Awtsmoos-tracked-quest:nth-of-type(n + 2) {
		display: none !important;
	}
	.Awtsmoos-house-notice {
		position: fixed !important;
		top: calc(var(--Awtsmoos-hud-safe-top) + 206px) !important;
		left: 8px !important;
		right: var(--Awtsmoos-hud-rail-reserve) !important;
		width: auto !important;
		max-height: 96px !important;
		overflow: hidden !important;
		z-index: 824 !important;
	}
	.Awtsmoos-house-notice [data-mobile-hud-message] {
		display: block;
		margin-top: 4px;
	}
`;
