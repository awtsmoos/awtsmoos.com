//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowCinematicPortraitCss.js
 * @description Composes the existing gameplay UI around a clear 390x844 portrait play corridor.
 * The Awtsmoos makes infinite purpose dwell in finite space; Awtsmoos.com keeps the center open
 * for the living Chossid while real Shlichus, map, rail, and actions remain within a thumb's reach.
 */

export const MINIMAL_MEADOW_CINEMATIC_PORTRAIT_CSS = `
@media (max-width: 600px) and (orientation: portrait) {
	html[data-awtsmoos-cinematic="true"] .Awtsmoos-minimap[data-mode="compact"] {
		position: fixed;
		top: max(12px, env(safe-area-inset-top));
		right: 12px;
		left: auto;
		width: 116px;
		height: 116px;
		max-width: 116px;
		z-index: 36;
	}

	html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-mini-tracker {
		position: fixed;
		top: max(18px, env(safe-area-inset-top));
		left: 12px;
		right: auto;
		width: min(218px, calc(100vw - 152px));
		max-height: 206px;
		overflow: auto;
		z-index: 35;
	}

	html[data-awtsmoos-cinematic="true"] .Awtsmoos-region-banner {
		position: fixed;
		top: max(136px, calc(env(safe-area-inset-top) + 124px));
		right: 14px;
		left: auto;
		max-width: 150px;
		text-align: right;
		z-index: 34;
	}

	html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail-host {
		position: fixed;
		top: max(206px, calc(env(safe-area-inset-top) + 194px));
		right: 10px;
		bottom: auto;
		left: auto;
		z-index: 38;
	}

	html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail {
		flex-direction: column;
		max-height: calc(100vh - 286px - env(safe-area-inset-bottom));
		overflow-y: auto;
		scrollbar-width: none;
	}

	html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail::-webkit-scrollbar {
		display: none;
	}

	html[data-awtsmoos-cinematic="true"] .Awtsmoos-core-mechanics {
		position: fixed;
		left: 12px;
		right: 72px;
		bottom: max(12px, env(safe-area-inset-bottom));
		z-index: 37;
	}

	html[data-awtsmoos-cinematic="true"] .Awtsmoos-core-mechanic-button {
		min-width: 48px;
		min-height: 48px;
	}
}
`;
