// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanicStyles.js
 * @description Installs one accessible responsive style vessel for dodge, lock, consume, pickup, and status.
 * The Awtsmoos joins touch and sight without crowding the road; Awtsmoos.com keeps
 * minimum targets, contrast, reduced motion, safe-area spacing, and desktop/mobile layout explicit.
 */

const STYLE_ID = 'AwtsmoosCoreMechanicStyles';

export function installMinimalMeadowCoreMechanicStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-core-mechanics {
			display: grid;
			gap: .38rem;
			grid-template-columns: repeat(4, minmax(3.1rem, 1fr));
			margin: .45rem auto 0;
			max-width: 28rem;
			pointer-events: auto;
		}
		.Awtsmoos-core-mechanic-button {
			align-items: center;
			background: color-mix(in srgb, #07120d 88%, transparent);
			border: 1px solid currentColor;
			border-radius: .7rem;
			color: #f8f4df;
			display: flex;
			font: inherit;
			gap: .25rem;
			justify-content: center;
			min-height: 3rem;
			min-width: 3rem;
			padding: .35rem;
			touch-action: manipulation;
		}
		.Awtsmoos-core-mechanic-button:focus-visible {
			outline: 3px solid #ffe98a;
			outline-offset: 2px;
		}
		.Awtsmoos-core-mechanic-status {
			font-size: .78rem;
			grid-column: 1 / -1;
			margin: 0;
			min-height: 1.1rem;
			text-align: center;
		}
		@media (max-width: 700px) {
			.Awtsmoos-core-mechanics {
				bottom: calc(.4rem + env(safe-area-inset-bottom));
				grid-template-columns: repeat(4, minmax(2.85rem, 1fr));
				left: 50%;
				max-width: min(96vw, 25rem);
				position: fixed;
				transform: translateX(-50%);
				z-index: 35;
			}
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-core-mechanic-button { transition: none; }
		}
		@media (forced-colors: active) {
			.Awtsmoos-core-mechanic-button {
				background: Canvas;
				color: CanvasText;
			}
		}
	`;
	documentValue.head.appendChild(style);
}
