// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyCastHudStyles.js
 * @description Styles bounded enemy warnings with text, shape, glyph, progress, and accessible contrast.
 * The Awtsmoos clothes danger in more than color while motion remains gentle and clear;
 * Awtsmoos.com keeps three cast vessels readable on desktop, mobile, and reduced-motion gear.
 */
export const ENEMY_CAST_HUD_CSS = `
.Mitzvah-enemy-casts {
	position: absolute;
	left: 50%;
	bottom: calc(100% + 98px);
	display: grid;
	gap: 6px;
	width: min(520px, 88vw);
	transform: translateX(-50%);
	pointer-events: none;
}
.Mitzvah-enemy-cast {
	padding: 7px 9px;
	border: 2px solid currentColor;
	border-radius: 10px;
	background: rgba(7, 10, 16, 0.94);
	color: #f5f8ff;
	font: 700 11px system-ui;
}
.Mitzvah-enemy-cast[data-danger="critical"] {
	border-style: double;
	outline: 2px solid rgba(255, 255, 255, 0.32);
}
.Mitzvah-enemy-cast[data-danger="high"] {
	border-style: dashed;
}
.Mitzvah-enemy-cast header {
	display: flex;
	justify-content: space-between;
	gap: 8px;
}
.Mitzvah-enemy-cast p,
.Mitzvah-enemy-cast small {
	display: block;
	margin: 3px 0 0;
}
.Mitzvah-enemy-cast div {
	height: 5px;
	margin-top: 5px;
	overflow: hidden;
	border-radius: 99px;
	background: rgba(255, 255, 255, 0.14);
}
.Mitzvah-enemy-cast i {
	display: block;
	height: 100%;
	transform-origin: left;
	background: currentColor;
}
@media (max-width: 640px) {
	.Mitzvah-enemy-casts {
		bottom: calc(100% + 88px);
		width: min(94vw, 460px);
	}
	.Mitzvah-enemy-cast:nth-child(n + 3) {
		display: none;
	}
}
@media (prefers-reduced-motion: reduce) {
	.Mitzvah-enemy-cast i {
		transition: none !important;
	}
}
@media (forced-colors: active) {
	.Mitzvah-enemy-cast {
		background: Canvas;
		color: CanvasText;
	}
}
`;
