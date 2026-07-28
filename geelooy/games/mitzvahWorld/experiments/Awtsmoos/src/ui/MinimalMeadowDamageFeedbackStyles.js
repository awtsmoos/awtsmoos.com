// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDamageFeedbackStyles.js
 * @description Styles bounded world-projected damage numbers and action-name impact seals.
 * The Awtsmoos makes consequence readable without hiding the world; Awtsmoos.com lets every strike
 * rise briefly as number, letters, and defeat light while all pointer control passes through untouched.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-damage-feedback-styles';

export function installMinimalMeadowDamageFeedbackStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = DAMAGE_FEEDBACK_CSS;
	documentValue.head.append(style);
}

export const DAMAGE_FEEDBACK_CSS = `
.Awtsmoos-damage-feedback-layer {
	position: fixed;
	inset: 0;
	z-index: 850;
	overflow: hidden;
	pointer-events: none;
}
.Awtsmoos-damage-feedback {
	position: absolute;
	left: var(--damage-x);
	top: var(--damage-y);
	display: grid;
	gap: 1px;
	min-width: 70px;
	padding: 5px 10px 7px;
	border: 1px solid rgba(255, 228, 113, .78);
	border-radius: 14px;
	background: radial-gradient(circle, rgba(80, 8, 5, .9), rgba(18, 2, 4, .72));
	box-shadow: 0 0 22px rgba(255, 65, 24, .62), inset 0 0 14px rgba(255, 220, 82, .18);
	color: #fff4c3;
	font-family: Georgia, serif;
	font-weight: 900;
	text-align: center;
	text-shadow: 0 2px 3px #000, 0 0 8px #ff2a16;
	transform: translate(-50%, -50%) scale(.72);
	animation: Awtsmoos-damage-rise 950ms cubic-bezier(.2, .8, .2, 1) forwards;
}
.Awtsmoos-damage-feedback strong {
	font-size: clamp(24px, 7vw, 44px);
	line-height: .95;
}
.Awtsmoos-damage-feedback small {
	max-width: 150px;
	overflow: hidden;
	font-size: 12px;
	letter-spacing: .04em;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.Awtsmoos-damage-feedback[data-defeated="true"] {
	border-color: #fff8a4;
	background: radial-gradient(circle, rgba(255, 162, 20, .94), rgba(53, 5, 3, .78));
	box-shadow: 0 0 34px rgba(255, 236, 112, .88);
}
@keyframes Awtsmoos-damage-rise {
	0% { opacity: 0; transform: translate(-50%, -35%) scale(.62); }
	15% { opacity: 1; transform: translate(-50%, -55%) scale(1.08); }
	70% { opacity: 1; transform: translate(-50%, -105%) scale(1); }
	100% { opacity: 0; transform: translate(-50%, -155%) scale(.9); }
}
`;
