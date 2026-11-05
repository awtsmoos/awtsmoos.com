// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionBaseStyles.js
 * @description Preserves cast, effect, feedback, and minimized-panel presentation primitives.
 * The Awtsmoos sends light through progress, consequence, and quiet concealment;
 * Awtsmoos.com keeps these finite signs legible before orientation rules place them.
 */

export const MOBILE_HUD_BASE_CSS = `
.Mitzvah-combat-host [hidden] {
	display: none !important;
}
.Mitzvah-castbar {
	position: absolute;
	left: 50%;
	bottom: calc(100% + 8px);
	width: min(360px, 76vw);
	padding: 8px 10px;
	border: 1px solid rgba(255, 209, 102, 0.42);
	border-radius: 10px;
	background: rgba(8, 12, 18, 0.96);
	color: #f6fbff;
	transform: translateX(-50%);
	pointer-events: none;
}
.Mitzvah-castbar header {
	display: flex;
	justify-content: space-between;
	gap: 8px;
	font: 700 11px system-ui;
}
.Mitzvah-castbar div {
	height: 7px;
	margin-top: 6px;
	overflow: hidden;
	border-radius: 99px;
	background: rgba(255, 255, 255, 0.12);
}
.Mitzvah-castbar i {
	display: block;
	height: 100%;
	background: linear-gradient(90deg, #3cf0c5, #ffd166);
	transition: width 80ms linear;
}
.Mitzvah-status-effects {
	position: absolute;
	left: 50%;
	bottom: calc(100% + 58px);
	display: flex;
	gap: 5px;
	width: min(420px, 78vw);
	transform: translateX(-50%);
	pointer-events: none;
}
.Mitzvah-status-effect {
	padding: 5px 7px;
	border: 1px solid rgba(122, 230, 255, 0.35);
	border-radius: 8px;
	background: rgba(7, 18, 28, 0.9);
	color: #e9fbff;
	font: 700 10px system-ui;
}
.Mitzvah-status-effect[data-kind="harmful"] {
	border-color: rgba(255, 91, 112, 0.45);
	color: #ffd6dd;
}
.Mitzvah-combat-feedback {
	position: fixed;
	left: 50%;
	top: 42%;
	z-index: 870;
	padding: 8px 12px;
	border-radius: 10px;
	background: rgba(5, 9, 14, 0.88);
	color: #ffffff;
	font: 800 13px system-ui;
	transform: translate(-50%, -50%);
	pointer-events: none;
}
.Mitzvah-combat-feedback[data-kind="damage"] {
	color: #ffb0bd;
}
.Mitzvah-combat-feedback[data-kind="heal"] {
	color: #a8ffd2;
}
`;
