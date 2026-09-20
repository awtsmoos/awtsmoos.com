//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowCinematicControlsCss.js
 * @description Gives the real game rail and core mechanic controls a premium, readable instrument language.
 * The Awtsmoos turns intention into deed through honest controls; Awtsmoos.com keeps each button
 * attached to the action it truly owns, with no painted promise standing in for play.
 */

export const MINIMAL_MEADOW_CINEMATIC_CONTROLS_CSS = `
html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail-host {
	filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.3));
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail {
	background: linear-gradient(180deg, rgba(20, 17, 12, 0.84), rgba(12, 11, 9, 0.7));
	border: 1px solid var(--Awtsmoos-cinematic-border);
	border-radius: 22px;
	padding: 8px;
	gap: 7px;
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail button {
	min-width: 44px;
	min-height: 44px;
	border: 1px solid rgba(236, 195, 108, 0.28);
	border-radius: 14px;
	background: rgba(255, 248, 226, 0.065);
	color: var(--Awtsmoos-cinematic-cream);
	transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail button:hover {
	background: rgba(233, 187, 98, 0.17);
	border-color: rgba(255, 217, 131, 0.62);
	transform: translateY(-1px);
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail button[aria-pressed="true"],
html[data-awtsmoos-cinematic="true"] .Awtsmoos-game-rail button[data-open="true"] {
	background: linear-gradient(145deg, rgba(231, 178, 72, 0.34), rgba(110, 76, 24, 0.34));
	border-color: var(--Awtsmoos-cinematic-gold-bright);
	box-shadow: inset 0 0 18px rgba(255, 208, 108, 0.11);
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-core-mechanics {
	background: linear-gradient(145deg, rgba(23, 20, 15, 0.82), rgba(12, 11, 9, 0.72));
	border: 1px solid var(--Awtsmoos-cinematic-border);
	border-radius: 20px;
	color: var(--Awtsmoos-cinematic-cream);
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-core-mechanic-button {
	min-width: 46px;
	min-height: 46px;
	border: 1px solid rgba(239, 198, 111, 0.36);
	border-radius: 14px;
	background: rgba(255, 248, 226, 0.08);
	color: var(--Awtsmoos-cinematic-cream);
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-core-mechanic-button:hover,
html[data-awtsmoos-cinematic="true"] .Awtsmoos-core-mechanic-button:active {
	background: rgba(233, 187, 98, 0.2);
	border-color: var(--Awtsmoos-cinematic-gold);
}

html[data-awtsmoos-cinematic="true"] .Awtsmoos-core-mechanic-status {
	color: var(--Awtsmoos-cinematic-olive);
	text-shadow: 0 1px 8px rgba(0, 0, 0, 0.65);
}
`;
