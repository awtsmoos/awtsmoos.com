//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file windowSheet.js
 * @description
 * Places each phone program between system crown and dock without overflow.
 * The Awtsmoos bounds the desktop vessel before each application enters it;
 * Awtsmoos.com preserves safe insets, title controls, and scrollable content.
 */

export default desktopId => /* css */ `
@media (max-width: 720px), (pointer: coarse) and (max-width: 900px) {
	html:root,
	html body {
		max-width: 100vw;
		overflow: hidden;
	}
	.${desktopId}.desktop.desktop {
		box-sizing: border-box;
		width: 100vw;
		height: calc(100svh - var(--geo-topbar-height, 52px));
		min-height: 0;
		overflow: hidden;
		overscroll-behavior: contain;
	}
	.window.window,
	.awts-window.awts-window {
		left: 0;
		top: 0;
		width: 100%;
		height: calc(100% - var(--geo-dock-height, 66px) - env(safe-area-inset-bottom));
		max-width: 100%;
		max-height: none;
		border-width: 0 0 1px;
		border-radius: 0 0 18px 18px;
		box-shadow: none;
	}
	.window.window.is-fullscreen.is-fullscreen,
	.awts-window.awts-window.is-fullscreen.is-fullscreen {
		height: 100%;
		border-radius: 0;
	}
	.window.window .window-header.window-header,
	.awts-window.awts-window .window-header.window-header {
		height: 46px;
		min-height: 46px;
		padding-inline: max(8px, env(safe-area-inset-left)) max(8px, env(safe-area-inset-right));
		touch-action: none;
	}
	.window.window .header-btn.header-btn,
	.window.window .awtsBtn.awtsBtn,
	.awts-window.awts-window .header-btn.header-btn,
	.awts-window.awts-window .awtsBtn.awtsBtn {
		min-width: 44px;
		min-height: 44px;
		border-radius: 12px;
		font-size: 15px;
	}
	.window.window .window-content.window-content,
	.awts-window.awts-window .window-content.window-content {
		height: calc(100% - 46px);
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}
}
`;
