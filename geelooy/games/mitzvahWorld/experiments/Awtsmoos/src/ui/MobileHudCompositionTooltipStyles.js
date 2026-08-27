// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionTooltipStyles.js
 * @description Preserves readable action explanations outside the occupied control rectangles.
 * The Awtsmoos gives understanding before action and meaning after symbol;
 * Awtsmoos.com keeps each tooltip spacious without allowing it to steal the player's touch.
 */

export const MOBILE_HUD_TOOLTIP_CSS = `
.Mitzvah-action-tooltip {
	position: absolute;
	left: 50%;
	bottom: calc(100% + 10px);
	z-index: 860;
	display: none;
	width: min(300px, 74vw);
	padding: 10px;
	border: 1px solid rgba(80, 245, 215, 0.35);
	border-radius: 11px;
	background: rgba(5, 11, 17, 0.97);
	color: #eaffff;
	box-shadow: 0 12px 28px rgba(0, 0, 0, 0.48);
	font: 600 11px/1.35 system-ui;
	transform: translateX(-50%);
	pointer-events: none;
}
.Mitzvah-action-tooltip[data-visible="true"] {
	display: block;
}
.Mitzvah-action-tooltip b {
	display: block;
	margin-bottom: 4px;
	color: #7fffe1;
	font-size: 12px;
}
.Mitzvah-action-tooltip small {
	display: block;
	margin-top: 5px;
	color: #bed4dc;
}
.Awtsmoos-hud-minimize {
	min-width: 30px;
	min-height: 30px;
	border: 1px solid rgba(255, 255, 255, 0.22);
	border-radius: 8px;
	background: rgba(5, 10, 18, 0.88);
	color: #ffffff;
	font: 800 16px system-ui;
	pointer-events: auto;
}
`;
