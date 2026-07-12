// B"H

export default /* css */ `
@media (max-width: 720px), (pointer: coarse) and (max-width: 900px) {
	.taskbar,
	.start-bar,
	body > div:has(> button) {
		width: 100vw !important;
		max-width: 100vw !important;
		box-sizing: border-box !important;
		overflow: hidden !important;
	}

	.awtsmoos-top-header,
	.awtsmoos-alias-bar,
	.alias-bar,
	.sync-alias-bar,
	[data-awtsmoos-alias-bar],
	[data-sync-alias] {
		min-height: 38px !important;
		max-width: 100vw !important;
		overflow-x: auto !important;
	}

	.login-area-container,
	.login-area,
	#loginHolder,
	.awtsmoosDrop,
	.notLoggedIn,
	.btn.dropt {
		max-width: 100vw !important;
	}

	.contextMenu {
		position: fixed !important;
		left: 10px !important;
		right: 10px !important;
		top: auto !important;
		bottom: calc(env(safe-area-inset-bottom, 0px) + 48px) !important;
		display: grid;
		gap: 4px;
		width: auto !important;
		max-width: none !important;
		border-radius: 18px 18px 22px 22px;
	}

	.contextMenu .menuItem {
		text-align: center;
		white-space: normal;
	}
}

@media (prefers-reduced-motion: reduce) {
	.desktop-icon {
		transition: none !important;
	}

	.desktop-search-overlay {
		backdrop-filter: none !important;
	}
}
`;
