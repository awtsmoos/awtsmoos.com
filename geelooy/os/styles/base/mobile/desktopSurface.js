// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file desktopSurface.js
 * @description
 * The Awtsmoos gathers touch icons into a finite grid instead of an endless list.
 * Awtsmoos.com keeps every app reachable without artificial vertical overflow.
 */

export default /* css */ `
.desktop-mobile,
.desktop-mobile * {
	-webkit-tap-highlight-color: transparent;
}
.desktop-mobile .awtsmoos-desktop-surface {
	display: grid !important;
	grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
	grid-auto-rows: minmax(104px, auto) !important;
	align-content: start !important;
	align-items: stretch !important;
	gap: 10px !important;
	min-height: 100% !important;
	padding: calc(var(--desktop-safe-top, 10px) + 44px) 10px calc(var(--desktop-safe-bottom, 82px) + 10px) !important;
	overflow-y: auto !important;
	overflow-x: hidden !important;
}
.desktop-mobile .desktop-icon {
	position: relative !important;
	left: auto !important;
	top: auto !important;
	transform: none !important;
	width: 100% !important;
	min-width: 0 !important;
	min-height: 104px !important;
	margin: 0 !important;
	padding: 10px 6px !important;
	border-radius: 18px !important;
	touch-action: manipulation !important;
}
.desktop-mobile .desktop-icon:hover {
	transform: none !important;
}
.desktop-mobile .desktop-icon:active {
	transform: scale(0.97) !important;
}
.desktop-mobile .desktop-icon-glyph {
	width: 48px;
	height: 48px;
	font-size: 36px;
}
.desktop-mobile .desktop-icon-label {
	max-width: 100%;
	font-size: 12px;
	line-height: 1.15;
	-webkit-line-clamp: 2;
}
.desktop-mobile .desktop-icon-badge {
	top: 6px;
	right: 6px;
	max-width: 58px;
	padding: 3px 6px;
	font-size: 8px;
}
.desktop-mobile .desktop-marquee {
	display: none !important;
}
.desktop-mobile .contextMenu {
	min-width: 0;
	font-size: 16px;
}
.desktop-mobile .contextMenu .menuItem {
	min-height: 48px;
}
@media (max-width: 360px) {
	.desktop-mobile .awtsmoos-desktop-surface {
		grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
	}
}
`;
