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
	body .Awtsmoos-status-dock.Awtsmoos-status-dock {
		position: fixed;
		top: calc(env(safe-area-inset-top) + 8px);
		right: auto;
		bottom: auto;
		left: var(--Awtsmoos-hud-side);
		width: var(--Awtsmoos-hud-card-width);
		max-width: calc(100vw - var(--Awtsmoos-hud-side) - 10px);
		max-height: 132px;
		margin: 0;
		overflow: hidden;
		transform: none;
		z-index: 824;
	}
	body .Awtsmoos-target-frame.Awtsmoos-target-frame {
		position: fixed;
		top: calc(env(safe-area-inset-top) + 142px);
		right: auto;
		bottom: auto;
		left: var(--Awtsmoos-hud-side);
		width: var(--Awtsmoos-hud-card-width);
		min-width: 0;
		max-width: calc(100vw - var(--Awtsmoos-hud-side) - var(--Awtsmoos-hud-rail-reserve));
		max-height: 90px;
		margin: 0;
		overflow: hidden;
		transform: none;
		z-index: 823;
	}
	body .Awtsmoos-target-frame.Awtsmoos-target-frame > *,
	body .Awtsmoos-target-frame.Awtsmoos-target-frame section {
		width: 100%;
		min-width: 0;
		max-width: 100%;
		max-height: 90px;
		overflow: hidden;
	}
	body .Awtsmoos-target-frame.Awtsmoos-target-frame .Awtsmoos-target-details.Awtsmoos-target-details {
		display: none;
	}
	body .Awtsmoos-status-ribbon.Awtsmoos-status-ribbon {
		position: fixed;
		top: calc(env(safe-area-inset-top) + 238px);
		right: auto;
		left: var(--Awtsmoos-hud-side);
		width: var(--Awtsmoos-hud-card-width);
		max-height: 36px;
		overflow: hidden;
		z-index: 822;
	}
	body .Awtsmoos-quest-tracker.Awtsmoos-quest-tracker {
		position: fixed;
		top: calc(env(safe-area-inset-top) + 282px);
		right: var(--Awtsmoos-hud-rail-reserve);
		left: var(--Awtsmoos-hud-side);
		width: auto;
		max-height: 102px;
		overflow: auto;
		overscroll-behavior: contain;
		z-index: 818;
	}
	body .Awtsmoos-quest-tracker.Awtsmoos-quest-tracker .Awtsmoos-tracked-quest.Awtsmoos-tracked-quest:nth-of-type(n + 2) {
		display: none;
	}
	body .Awtsmoos-house-notice.Awtsmoos-house-notice {
		position: fixed;
		top: calc(env(safe-area-inset-top) + 392px);
		right: var(--Awtsmoos-hud-rail-reserve);
		left: var(--Awtsmoos-hud-side);
		width: auto;
		max-height: 92px;
		overflow: hidden;
		z-index: 824;
	}
`;
