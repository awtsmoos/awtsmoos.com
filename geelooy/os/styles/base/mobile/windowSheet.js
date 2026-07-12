// B"H

export default desktopId => /* css */ `
@media (max-width: 720px), (pointer: coarse) and (max-width: 900px) {
	html,
	body {
		max-width: 100vw !important;
		overflow-x: hidden !important;
		overflow-y: auto !important;
	}

	.${desktopId}.desktop {
		width: 100vw !important;
		height: calc(100svh - 40px) !important;
		min-height: calc(100svh - 40px) !important;
		overflow-x: hidden !important;
		overflow-y: auto !important;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
	}

	.window,
	.awts-window {
		left: 0 !important;
		top: var(--desktop-safe-top, 0) !important;
		width: 100vw !important;
		height: calc(100svh - var(--desktop-safe-top, 0px) - 44px) !important;
		max-width: 100vw !important;
		border-right: 0 !important;
		border-left: 0 !important;
		border-radius: 0 !important;
	}

	.window .window-header,
	.awts-window .window-header {
		height: 40px !important;
		min-height: 40px !important;
		padding-inline: 8px;
		touch-action: none;
	}

	.window .header-btn,
	.awts-window .header-btn {
		min-width: 42px !important;
		min-height: 42px !important;
		border-radius: 10px !important;
		font-size: 15px !important;
	}

	.window .window-content,
	.awts-window .window-content {
		height: calc(100% - 40px) !important;
		overflow: auto;
	}
}
`;
