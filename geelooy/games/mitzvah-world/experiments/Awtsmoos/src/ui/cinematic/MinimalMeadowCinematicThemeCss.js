//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowCinematicThemeCss.js
 * @description Defines the warm visual covenant shared by the cinematic Blank Meadow UI.
 * The Awtsmoos renews every visible vessel from nothing each instant; Awtsmoos.com lets
 * gold, parchment, olive, and shadow reveal gameplay truth without painting a false world.
 */

export const MINIMAL_MEADOW_CINEMATIC_THEME_CSS = `
html[data-awtsmoos-cinematic="true"] {
	--Awtsmoos-cinematic-gold: #e9bb62;
	--Awtsmoos-cinematic-gold-bright: #ffd983;
	--Awtsmoos-cinematic-cream: #fff3d2;
	--Awtsmoos-cinematic-ink: rgba(17, 14, 10, 0.9);
	--Awtsmoos-cinematic-glass: rgba(22, 18, 13, 0.74);
	--Awtsmoos-cinematic-glass-soft: rgba(26, 22, 16, 0.58);
	--Awtsmoos-cinematic-border: rgba(244, 204, 119, 0.48);
	--Awtsmoos-cinematic-olive: #9fbd78;
	--Awtsmoos-cinematic-shadow: 0 16px 38px rgba(0, 0, 0, 0.34);
	--Awtsmoos-cinematic-story-font: Georgia, "Times New Roman", serif;
	--Awtsmoos-cinematic-ui-font: Inter, ui-sans-serif, system-ui, sans-serif;
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-ui-layer,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-ui-host {
	font-family: var(--Awtsmoos-cinematic-ui-font);
}

html[data-awtsmoos-cinematic="true"] button:focus-visible,
html[data-awtsmoos-cinematic="true"] [tabindex]:focus-visible {
	outline: 2px solid var(--Awtsmoos-cinematic-gold-bright);
	outline-offset: 3px;
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-core-mechanics,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-mini-tracker,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-tracker,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-minimap {
	backdrop-filter: blur(14px) saturate(1.08);
	-webkit-backdrop-filter: blur(14px) saturate(1.08);
	box-shadow: var(--Awtsmoos-cinematic-shadow);
}

@media (prefers-reduced-motion: reduce) {
	html[data-awtsmoos-cinematic="true"] *,
	html[data-awtsmoos-cinematic="true"] *::before,
	html[data-awtsmoos-cinematic="true"] *::after {
		transition-duration: 0.001ms;
		animation-duration: 0.001ms;
	}
}
`;
