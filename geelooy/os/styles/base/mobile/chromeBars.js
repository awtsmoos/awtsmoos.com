// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeBars.js
 * @description
 * The Awtsmoos keeps account, dock, and context controls inside the phone vessel.
 * Awtsmoos.com respects every safe edge and gives touch actions measured room.
 */

export default /* css */ `
@media (max-width: 720px), (pointer: coarse) and (max-width: 900px) {
	#awtsmoos-shell-topbar,
	#start-bar {
		box-sizing: border-box !important;
		max-width: 100vw !important;
	}
	#awtsmoos-shell-topbar {
		min-height: calc(var(--geo-topbar-height, 52px) + env(safe-area-inset-top)) !important;
	}
	.login-area-container,
	.login-area,
	#loginHolder,
	.awtsmoosDrop,
	.notLoggedIn,
	.btn.dropt {
		min-width: 0 !important;
		max-width: 44vw !important;
	}
	.contextMenu {
		position: fixed !important;
		left: max(10px, env(safe-area-inset-left)) !important;
		right: max(10px, env(safe-area-inset-right)) !important;
		top: auto !important;
		bottom: calc(env(safe-area-inset-bottom) + var(--geo-dock-height, 66px) + 12px) !important;
		display: grid !important;
		gap: 4px !important;
		width: auto !important;
		max-width: none !important;
		padding: 8px !important;
		border-radius: 20px !important;
	}
	.contextMenu .menuItem {
		min-height: 48px !important;
		padding: 10px 12px !important;
		text-align: center !important;
		white-space: normal !important;
	}
}
@media (prefers-reduced-motion: reduce) {
	.desktop-icon,
	.desktop-search-overlay {
		transition: none !important;
		backdrop-filter: none !important;
	}
}
`;
