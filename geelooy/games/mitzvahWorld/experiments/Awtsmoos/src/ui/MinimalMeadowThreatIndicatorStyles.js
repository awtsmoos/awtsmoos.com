// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowThreatIndicatorStyles.js
 * @description Styles one brief pointer-transparent enemy telegraph above the action lane.
 * The Awtsmoos reveals danger before consequence; Awtsmoos.com lets alert, windup, projectile,
 * miss, and safety appear as distinct finite signals without covering movement or combat controls.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-threat-indicator-styles';

export function installMinimalMeadowThreatIndicatorStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = THREAT_INDICATOR_CSS;
	documentValue.head.append(style);
}

export const THREAT_INDICATOR_CSS = `
.Awtsmoos-threat-indicator {
	position: fixed;
	left: 50%;
	bottom: calc(max(10px, env(safe-area-inset-bottom)) + 230px);
	z-index: 846;
	display: grid;
	grid-template-columns: 34px minmax(0, 1fr);
	gap: 8px;
	align-items: center;
	width: min(330px, calc(100vw - 112px));
	padding: 9px 13px;
	border: 1px solid rgba(255, 112, 72, .8);
	border-radius: 15px;
	background: linear-gradient(145deg, rgba(66, 10, 9, .94), rgba(15, 3, 6, .9));
	box-shadow: 0 0 26px rgba(255, 51, 28, .38);
	color: #fff1d1;
	font: 800 13px/1.2 system-ui;
	pointer-events: none;
	opacity: 0;
	transform: translate(-50%, 14px) scale(.96);
	transition: opacity .16s ease, transform .16s ease;
}
.Awtsmoos-threat-indicator[data-open="true"] {
	opacity: 1;
	transform: translate(-50%, 0) scale(1);
}
.Awtsmoos-threat-indicator > span { font-size: 25px; text-align: center; }
.Awtsmoos-threat-indicator strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.Awtsmoos-threat-indicator small { display: block; color: #ffc1a4; font-weight: 650; }
.Awtsmoos-threat-indicator[data-level="warning"] { border-color: #ffd36a; box-shadow: 0 0 28px rgba(255, 197, 59, .42); }
.Awtsmoos-threat-indicator[data-level="safe"] { border-color: #72e7a2; background: linear-gradient(145deg, rgba(8, 57, 34, .94), rgba(3, 18, 15, .9)); box-shadow: 0 0 24px rgba(61, 221, 126, .34); }
@media (max-width: 520px) {
	.Awtsmoos-threat-indicator { bottom: calc(max(10px, env(safe-area-inset-bottom)) + 224px); }
}
`;
