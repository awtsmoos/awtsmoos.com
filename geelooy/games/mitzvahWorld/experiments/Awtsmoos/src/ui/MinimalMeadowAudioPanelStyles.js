// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioPanelStyles.js
 * @description Styles one thumb-safe collapsible audio control that yields the screen to gameplay.
 * The Awtsmoos hides complexity inside a small merciful gate and rhyme; Awtsmoos.com keeps
 * safe areas, focus, contrast, readable labels, and forty-eight-pixel touch truth aligned in time.
 */

const STYLE_ID = 'Awtsmoos-audio-panel-style';

export function installMinimalMeadowAudioPanelStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) {
		return;
	}
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-audio-panel {
			position: fixed;
			right: max(12px, env(safe-area-inset-right));
			top: max(12px, env(safe-area-inset-top));
			z-index: 780;
			font: 700 13px/1.25 system-ui, sans-serif;
			color: #fff8e7;
		}
		.Awtsmoos-audio-panel summary {
			display: grid;
			place-items: center;
			width: 48px;
			height: 48px;
			margin-left: auto;
			border: 2px solid rgba(245, 213, 139, .72);
			border-radius: 14px;
			background: rgba(5, 14, 12, .9);
			cursor: pointer;
			list-style: none;
			user-select: none;
		}
		.Awtsmoos-audio-panel summary::-webkit-details-marker {
			display: none;
		}
		.Awtsmoos-audio-panel summary:focus-visible {
			outline: 3px solid #f2c66f;
			outline-offset: 3px;
		}
		.Awtsmoos-audio-panel form {
			display: grid;
			gap: 9px;
			width: min(260px, calc(100vw - 24px));
			margin-top: 8px;
			padding: 12px;
			border: 1px solid rgba(245, 213, 139, .55);
			border-radius: 14px;
			background: rgba(5, 14, 12, .95);
			box-shadow: 0 10px 30px rgba(0, 0, 0, .38);
		}
		.Awtsmoos-audio-panel label {
			display: grid;
			grid-template-columns: 76px 1fr;
			align-items: center;
			gap: 8px;
		}
		.Awtsmoos-audio-panel input[type=range] {
			width: 100%;
			min-height: 32px;
			accent-color: #f2c66f;
		}
		.Awtsmoos-audio-panel .Awtsmoos-audio-mute {
			min-height: 44px;
			grid-template-columns: 1fr auto;
		}
		.Awtsmoos-audio-panel input[type=checkbox] {
			width: 24px;
			height: 24px;
			accent-color: #f2c66f;
		}
		@media (max-width: 720px) {
			.Awtsmoos-audio-panel {
				top: max(8px, env(safe-area-inset-top));
				right: max(8px, env(safe-area-inset-right));
			}
			.Awtsmoos-audio-panel summary {
				width: 50px;
				height: 50px;
			}
		}
	`;
	documentValue.head.appendChild(style);
}
