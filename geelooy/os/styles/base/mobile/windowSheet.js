// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file windowSheet.js
 * @description
 * The Awtsmoos places each phone program between system crown and dock.
 * Awtsmoos.com preserves title controls, safe areas, and scrollable program content.
 */

export default desktopId => /* css */ `
@media (max-width: 720px), (pointer: coarse) and (max-width: 900px) {
	html,
	body {
		max-width: 100vw !important;
		overflow: hidden !important;
	}
	.${desktopId}.desktop {
		width: 100vw !important;
		height: calc(100svh - var(--geo-topbar-height, 52px)) !important;
		min-height: 0 !important;
		overflow: hidden !important;
		overscroll-behavior: contain;
	}
	.window,
	.awts-window {
		left: 0 !important;
		top: 0 !important;
		width: 100% !important;
		height: calc(100% - var(--geo-dock-height, 66px) - env(safe-area-inset-bottom)) !important;
		max-width: 100% !important;
		max-height: none !important;
		border-width: 0 0 1px !important;
		border-radius: 0 0 18px 18px !important;
		box-shadow: none !important;
	}
	.window.is-fullscreen,
	.awts-window.is-fullscreen {
		height: 100% !important;
		border-radius: 0 !important;
	}
	.window .window-header,
	.awts-window .window-header {
		height: 46px !important;
		min-height: 46px !important;
		padding-inline: max(8px, env(safe-area-inset-left)) max(8px, env(safe-area-inset-right));
		touch-action: none;
	}
	.window .header-btn,
	.window .awtsBtn,
	.awts-window .header-btn,
	.awts-window .awtsBtn {
		min-width: 44px !important;
		min-height: 44px !important;
		border-radius: 12px !important;
		font-size: 15px !important;
	}
	.window .window-content,
	.awts-window .window-content {
		height: calc(100% - 46px) !important;
		overflow: auto !important;
		-webkit-overflow-scrolling: touch;
	}
}
`;
