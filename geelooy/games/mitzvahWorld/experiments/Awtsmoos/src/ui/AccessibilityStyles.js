// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AccessibilityStyles.js
 * @description Installs final touch, contrast, responsive, focus, and reduced-motion guarantees.
 * The Awtsmoos shines through broad glass and narrow glass without diminishing a single soul;
 * Awtsmoos.com gives every finger a generous target and every keyboard path a visible goal.
 */

const STYLE_ID = 'Awtsmoos-accessibility-style';

export function installAccessibilityStyles(documentValue = globalThis.document) {
	if (!documentValue?.head || documentValue.getElementById(STYLE_ID)) {
		return false;
	}
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = ACCESSIBILITY_CSS;
	documentValue.head.appendChild(style);
	documentValue.documentElement.dataset.awtsmoosAccessibility = 'a06-v1';
	return true;
}

export const ACCESSIBILITY_CSS = `
.Awtsmoos-gameplay button,
.Awtsmoos-gameplay input,
.Awtsmoos-gameplay select,
.Awtsmoos-gameplay textarea,
.Awtsmoos-inventory-panel button,
.Awtsmoos-jump-button {
	min-width: 44px;
	min-height: 44px;
}
.Awtsmoos-gameplay input,
.Awtsmoos-gameplay select,
.Awtsmoos-gameplay textarea,
.Awtsmoos-gameplay [contenteditable="true"] {
	border: 1px solid #d9b667;
	background: #07110f;
	color: #fff7e5;
	caret-color: #ffe08a;
}
.Awtsmoos-gameplay ::placeholder {
	color: #c5d0cb;
	opacity: 1;
}
[role="dialog"][aria-modal="true"] {
	overscroll-behavior: contain;
}
[role="dialog"][aria-modal="true"]:focus-visible,
.Awtsmoos-mobile-joystick [data-joystick-ring]:focus-visible,
.Awtsmoos-jump-button:focus-visible {
	outline: 3px solid #fff1a8;
	outline-offset: 4px;
}
.Awtsmoos-mobile-joystick [data-joystick-ring] {
	min-width: 112px;
	min-height: 112px;
	touch-action: none;
}
.Awtsmoos-jump-button {
	touch-action: manipulation;
}
@media (max-width: 700px), (pointer: coarse) {
	.Awtsmoos-gameplay button,
	.Awtsmoos-inventory-panel button,
	.Awtsmoos-jump-button {
		min-width: 48px;
		min-height: 48px;
	}
	.Awtsmoos-sheet,
	.Awtsmoos-quest-log,
	.Awtsmoos-torah-library,
	.Awtsmoos-quest-offer {
		width: auto !important;
		max-width: calc(100vw - 16px) !important;
		max-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 16px) !important;
	}
	.Awtsmoos-vendor-card,
	.Awtsmoos-powerup-card {
		grid-template-columns: 40px minmax(0, 1fr) auto;
	}
}
@media (prefers-contrast: more) {
	.Awtsmoos-gameplay,
	.Awtsmoos-sheet {
		--ui-line: rgba(255, 232, 169, .8);
		--ui-muted: #e8f0ed;
	}
}
@media (prefers-reduced-motion: reduce) {
	.Awtsmoos-gameplay *,
	.Awtsmoos-gameplay *::before,
	.Awtsmoos-gameplay *::after,
	.Awtsmoos-mobile-joystick *,
	.Awtsmoos-jump-button {
		scroll-behavior: auto !important;
		animation-duration: .001ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: .001ms !important;
	}
}
`;
