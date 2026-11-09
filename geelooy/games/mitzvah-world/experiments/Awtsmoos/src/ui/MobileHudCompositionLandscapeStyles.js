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
	.Awtsmoos-status-dock.Awtsmoos-status-dock {
		position: fixed;
		top: calc(var(--Awtsmoos-hud-safe-top) + 8px);
		left: 8px;
		width: 210px;
		max-height: 44px;
		overflow: hidden;
	}
	.Awtsmoos-status-ribbon.Awtsmoos-status-ribbon {
		position: fixed;
		top: calc(var(--Awtsmoos-hud-safe-top) + 56px);
		left: 8px;
		width: 210px;
		max-height: 24px;
		overflow: hidden;
	}
	.Awtsmoos-quest-tracker.Awtsmoos-quest-tracker {
		position: fixed;
		top: calc(var(--Awtsmoos-hud-safe-top) + 8px);
		left: 226px;
		width: 260px;
		max-height: 72px;
		overflow: hidden;
	}
	.Awtsmoos-quest-tracker.Awtsmoos-quest-tracker .Awtsmoos-tracked-quest.Awtsmoos-tracked-quest:nth-of-type(n + 2) {
		display: none;
	}
	.Awtsmoos-target-frame.Awtsmoos-target-frame {
		top: calc(var(--Awtsmoos-hud-safe-top) + 8px);
		left: 494px;
		right: var(--Awtsmoos-hud-rail-reserve);
		width: auto;
		min-width: 0;
		max-height: 72px;
		transform: none;
	}
	.Awtsmoos-target-frame.Awtsmoos-target-frame section {
		display: block;
		max-height: 72px;
		overflow: hidden;
	}
	.Awtsmoos-target-details.Awtsmoos-target-details {
		display: none;
	}
	.Awtsmoos-house-notice.Awtsmoos-house-notice {
		position: fixed;
		top: calc(var(--Awtsmoos-hud-safe-top) + 88px);
		left: 8px;
		width: 478px;
		max-height: 64px;
		overflow: hidden;
	}
	.Mitzvah-status-effects.Mitzvah-status-effects {
		position: fixed;
		top: calc(var(--Awtsmoos-hud-safe-top) + 160px);
		left: 170px;
		right: var(--Awtsmoos-hud-rail-reserve);
		bottom: auto;
		width: auto;
		max-height: 30px;
		overflow: hidden;
		transform: none;
	}
	.Mitzvah-combat-host.Mitzvah-combat-host {
		position: fixed;
		top: calc(var(--Awtsmoos-hud-safe-top) + 194px);
		left: 170px;
		right: var(--Awtsmoos-hud-rail-reserve);
		bottom: auto;
		max-height: 52px;
		overflow: hidden;
	}
	.Awtsmoos-cast-meter.Awtsmoos-cast-meter,
	.Mitzvah-castbar.Mitzvah-castbar {
		position: fixed;
		left: 170px;
		right: var(--Awtsmoos-hud-rail-reserve);
		bottom: calc(var(--Awtsmoos-hud-safe-bottom) + 78px);
		width: auto;
		max-width: none;
		max-height: 36px;
		transform: none;
	}
	.Awtsmoos-combat-host.Awtsmoos-combat-host,
	.Awtsmoos-action-host.Awtsmoos-action-host {
		position: fixed;
		left: 170px;
		right: var(--Awtsmoos-hud-rail-reserve);
		bottom: calc(var(--Awtsmoos-hud-safe-bottom) + 8px);
		width: auto;
		max-width: none;
	}
	[data-awtsmoos-minimized="true"][data-awtsmoos-minimized="true"] > :not(.Awtsmoos-hud-minimize) {
		display: none;
	}
}
`;
