// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudStyles.js
 * @description Installs compact accessible styling for intention, posture, knowledge, boss, and feedback.
 * The Awtsmoos reveals one living grammar through word, pattern, meter, border, and position;
 * Awtsmoos.com keeps color optional, motion bounded, text scalable, and mobile controls unobscured.
 */

const STYLE_ID = 'Awtsmoos-vertical-slice-hud-style';

export function installMinimalMeadowVerticalSliceHudStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = hudCss();
	documentValue.head.appendChild(style);
}

function hudCss() {
	return `
		.Awtsmoos-vertical-slice-hud {
			position: fixed;
			left: 14px;
			top: 72px;
			z-index: 735;
			display: grid;
			gap: 7px;
			width: min(330px, calc(100vw - 28px));
			font-size: calc(12px * var(--awtsmoos-text-scale, 1));
			pointer-events: none;
		}
		.Awtsmoos-vertical-card {
			padding: 8px 10px;
			border: 2px solid rgba(245, 213, 139, .62);
			border-left-style: double;
			border-radius: 12px;
			background: rgba(5, 14, 12, .91);
			color: #fff8e7;
			box-shadow: 0 8px 26px rgba(0, 0, 0, .34);
		}
		.Awtsmoos-vertical-card[hidden] { display: none; }
		.Awtsmoos-vertical-card header {
			display: flex;
			justify-content: space-between;
			gap: 8px;
			font-weight: 900;
		}
		.Awtsmoos-vertical-card p {
			margin: 4px 0 0;
			line-height: 1.35;
		}
		.Awtsmoos-vertical-card progress {
			width: 100%;
			height: 9px;
			accent-color: #f2c66f;
		}
		.Awtsmoos-vertical-card[data-state="broken"],
		.Awtsmoos-vertical-card[data-state="danger"] {
			border-style: dashed;
		}
		.Awtsmoos-vertical-card[data-state="aligned"] {
			border-style: double;
		}
		.Awtsmoos-vertical-feedback {
			border-left-width: 6px;
		}
		@media (max-width: 720px) {
			.Awtsmoos-vertical-slice-hud {
				left: 8px;
				top: max(56px, env(safe-area-inset-top));
				width: min(285px, calc(100vw - 16px));
			}
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-vertical-slice-hud * {
				animation: none !important;
				transition: none !important;
			}
		}
		@media (forced-colors: active) {
			.Awtsmoos-vertical-card {
				border-color: CanvasText;
				background: Canvas;
				color: CanvasText;
				forced-color-adjust: auto;
			}
			.Awtsmoos-vertical-card progress { accent-color: Highlight; }
		}
		@media (prefers-contrast: more) {
			.Awtsmoos-vertical-card {
				border-width: 3px;
				background: #000;
				color: #fff;
			}
		}
	`;
}
