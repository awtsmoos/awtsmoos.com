//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowCinematicMapQuestCss.js
 * @description Shapes the real minimap, Shlichus tracker, and region witness into one cinematic language.
 * The Awtsmoos gives every path its place and every mission its measure; Awtsmoos.com keeps the
 * golden compass bound to actual runtime truth, never to invented treasure.
 */

export const MINIMAL_MEADOW_CINEMATIC_MAP_QUEST_CSS = `
html[data-awtsmoos-cinematic="true"] .Awtsmoos-minimap {
	background: linear-gradient(145deg, rgba(33, 29, 19, 0.9), rgba(12, 12, 10, 0.8));
	border: 1px solid var(--Awtsmoos-cinematic-border);
	color: var(--Awtsmoos-cinematic-cream);
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-minimap[data-mode="compact"] {
	border-radius: 50%;
	overflow: hidden;
	box-shadow: 0 0 0 2px rgba(62, 46, 21, 0.7), 0 14px 34px rgba(0, 0, 0, 0.42);
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-minimap[data-mode="compact"] .Awtsmoos-map-canvas {
	border-radius: 50%;
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-map-actions button,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-minimap button {
	background: rgba(23, 19, 13, 0.78);
	border-color: rgba(238, 193, 103, 0.4);
	color: var(--Awtsmoos-cinematic-cream);
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-map-player {
	filter: drop-shadow(0 0 5px rgba(255, 217, 131, 0.88));
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-mini-tracker,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-tracker {
	background: linear-gradient(135deg, rgba(22, 18, 13, 0.86), rgba(40, 31, 18, 0.67));
	border: 1px solid var(--Awtsmoos-cinematic-border);
	color: var(--Awtsmoos-cinematic-cream);
	border-radius: 16px;
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-mini-tracker::before,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-tracker::before {
	content: "";
	display: block;
	height: 1px;
	background: linear-gradient(90deg, transparent, var(--Awtsmoos-cinematic-gold), transparent);
	opacity: 0.78;
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-mini-tracker h2,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-mini-tracker h3,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-tracker h2,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-quest-tracker h3 {
	font-family: var(--Awtsmoos-cinematic-story-font);
	color: var(--Awtsmoos-cinematic-gold-bright);
	letter-spacing: 0.01em;
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-region-banner {
	font-family: var(--Awtsmoos-cinematic-story-font);
	color: var(--Awtsmoos-cinematic-cream);
	text-shadow: 0 2px 12px rgba(0, 0, 0, 0.78);
	border-color: rgba(234, 190, 98, 0.34);
}
`;
