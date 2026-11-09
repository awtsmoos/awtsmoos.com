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
	#awtsmoos-shell-topbar#awtsmoos-shell-topbar,
	#start-bar#start-bar {
		box-sizing: border-box;
		max-width: 100vw;
	}
	#awtsmoos-shell-topbar#awtsmoos-shell-topbar {
		min-height: calc(var(--geo-topbar-height, 52px) + env(safe-area-inset-top));
	}
	.login-area-container.login-area-container,
	.login-area.login-area,
	#loginHolder#loginHolder,
	.awtsmoosDrop.awtsmoosDrop,
	.notLoggedIn.notLoggedIn,
	.btn.btn.dropt.dropt {
		min-width: 0;
		max-width: 44vw;
	}
	.contextMenu.contextMenu {
		position: fixed;
		left: max(10px, env(safe-area-inset-left));
		right: max(10px, env(safe-area-inset-right));
		top: auto;
		bottom: calc(env(safe-area-inset-bottom) + var(--geo-dock-height, 66px) + 12px);
		display: grid;
		gap: 4px;
		width: auto;
		max-width: none;
		padding: 8px;
		border-radius: 20px;
	}
	.contextMenu.contextMenu .menuItem.menuItem {
		min-height: 48px;
		padding: 10px 12px;
		text-align: center;
		white-space: normal;
	}
}
@media (prefers-reduced-motion: reduce) {
	.desktop-icon.desktop-icon,
	.desktop-search-overlay.desktop-search-overlay {
		transition: none;
		backdrop-filter: none;
	}
}
`;
