// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestParchmentBaseStyles.js
 * @description Styles the illuminated Shlichus story, reward seal, placement choice, and actions.
 * The Awtsmoos gives a finite mission the dignity of an illuminated page; Awtsmoos.com
 * keeps its story, choice, reward, and counsel readable on narrow glass and broad display.
 */

export const MINIMAL_MEADOW_QUEST_PARCHMENT_BASE_CSS = `
.Awtsmoos-quest-parchment-backdrop {
	position: fixed;
	inset: 0;
	z-index: 970;
	display: grid;
	place-items: center;
	padding: max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom));
	background: radial-gradient(circle at 50% 18%, rgba(48, 73, 61, .4), rgba(2, 5, 4, .88));
	backdrop-filter: blur(10px);
	pointer-events: auto;
}
.Awtsmoos-quest-parchment-backdrop[hidden] {
	display: none;
}
.Awtsmoos-quest-parchment {
	position: relative;
	width: min(720px, 96vw);
	max-height: min(88dvh, 820px);
	overflow: auto;
	padding: clamp(22px, 4vw, 42px);
	border: 2px solid #b89147;
	border-radius: 26px;
	background: linear-gradient(145deg, #f2dfae, #d7b879 52%, #ad8248);
	color: #2a190c;
	box-shadow: 0 34px 100px rgba(0, 0, 0, .68), inset 0 0 50px rgba(89, 47, 13, .18);
	font: 16px/1.55 Georgia, serif;
}
.Awtsmoos-quest-parchment::before {
	content: "";
	position: absolute;
	inset: 9px;
	border: 1px solid rgba(80, 45, 17, .38);
	border-radius: 19px;
	pointer-events: none;
}
.quest-close {
	position: sticky;
	top: 0;
	float: right;
	z-index: 2;
	width: 48px;
	height: 48px;
	border: 1px solid #6e351e;
	border-radius: 50%;
	background: #34180f;
	color: #ffe4a1;
	font-size: 28px;
}
.quest-story-header {
	padding: 6px 30px 18px;
	text-align: center;
}
.Awtsmoos-quest-seal {
	margin: 0;
	color: #71341e;
	font-weight: 900;
	letter-spacing: .16em;
	text-transform: uppercase;
}
.quest-story-header small {
	display: block;
	margin: 8px 0;
	color: #765328;
	letter-spacing: .08em;
}
.quest-story-header h2 {
	margin: 8px 0;
	color: #32170d;
	font-size: clamp(31px, 7vw, 52px);
	line-height: 1.02;
}
.Awtsmoos-quest-giver {
	margin: 0;
	color: #60401e;
	font-weight: 800;
}
.quest-story-scroll {
	display: grid;
	gap: 12px;
}
.quest-opening {
	font-size: 1.08em;
	font-style: italic;
}
.quest-story-section {
	padding: 12px 14px;
	border-left: 4px solid #8b5725;
	border-radius: 8px;
	background: rgba(255, 248, 219, .42);
}
.quest-story-section h3 {
	margin: 0 0 4px;
	color: #4d250f;
	font-size: 1em;
	letter-spacing: .08em;
	text-transform: uppercase;
}
.quest-story-section p {
	margin: 0;
}
`;
