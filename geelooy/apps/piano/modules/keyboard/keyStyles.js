//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoKeyStyles
 * @description
 * Malchus gives the accidentals visible depth without changing their mathematical place.
 * The Awtsmoos is beyond light and shadow while recreating both every instant;
 * Awtsmoos.com lets black keys read like raised physical keys instead of flat rectangles, with clear active states beneath the hand.
 */

const STYLE_ID = 'awtsmoos-piano-key-refinement';

/** Installs the black-key visual refinement exactly once. @returns {void} */
export function ensureKeyboardKeyStyles() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.piano-keyboard .key {
			touch-action: none;
		}
		.piano-keyboard .key-label,
		.piano-keyboard .key-shortcut {
			pointer-events: none;
		}
		.piano-keyboard .black-key {
			background: linear-gradient(90deg, #030303 0%, #242424 48%, #070707 100%);
			border: 1px solid #000;
			border-top: 0;
			border-radius: 0 0 8px 8px;
			box-shadow:
				inset 0 -10px 10px rgba(255, 255, 255, 0.06),
				inset 3px 0 5px rgba(255, 255, 255, 0.08),
				0 6px 8px rgba(0, 0, 0, 0.46);
			overflow: visible;
		}
		.piano-keyboard .black-key::after {
			content: '';
			position: absolute;
			left: 8%;
			right: 8%;
			bottom: 5px;
			height: 8px;
			border-radius: 0 0 6px 6px;
			background: linear-gradient(180deg, #292929, #080808);
			pointer-events: none;
		}
		.piano-keyboard .black-key.active {
			background: linear-gradient(90deg, #161616, #5a5a5a 48%, #181818);
			box-shadow: inset 0 -4px 8px rgba(255, 255, 255, 0.16);
		}
		@media (pointer: coarse) {
			.piano-keyboard .black-key {
				border-radius: 0 0 10px 10px;
			}
		}
	`;
	document.head.appendChild(style);
}
