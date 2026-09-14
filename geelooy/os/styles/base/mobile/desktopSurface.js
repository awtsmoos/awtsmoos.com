//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file desktopSurface.js
 * @description
 * Gives the phone desktop a compact two-column first layer instead of giant cards.
 * The Awtsmoos gathers many possible paths into a measured vessel; Awtsmoos.com
 * keeps touch entrances calm while deeper pages remain available when requested.
 */

export default /* css */ `
.awtsmoos-desktop-surface.desktop-mobile,
.awtsmoos-desktop-surface.desktop-mobile * {
	box-sizing: border-box !important;
	-webkit-tap-highlight-color: transparent;
}
.awtsmoos-desktop-surface.desktop-mobile {
	display: grid !important;
	grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
	grid-auto-rows: minmax(88px, auto) !important;
	align-content: start !important;
	align-items: stretch !important;
	gap: 12px !important;
	width: 100vw !important;
	max-width: 100vw !important;
	min-width: 0 !important;
	min-height: 100% !important;
	padding: calc(var(--desktop-safe-top, 10px) + 16px) 12px calc(var(--desktop-safe-bottom, 82px) + 14px) !important;
	overflow-y: auto !important;
	overflow-x: hidden !important;
}
.awtsmoos-desktop-surface.desktop-mobile .desktop-icon {
	position: relative !important;
	left: auto !important;
	top: auto !important;
	transform: none !important;
	width: 100% !important;
	min-width: 0 !important;
	min-height: 88px !important;
	margin: 0 !important;
	padding: 10px 8px !important;
	border-radius: 18px !important;
	touch-action: manipulation !important;
}
.awtsmoos-desktop-surface.desktop-mobile .desktop-icon:hover {
	transform: none !important;
}
.awtsmoos-desktop-surface.desktop-mobile .desktop-icon:active {
	transform: scale(0.97) !important;
}
.awtsmoos-desktop-surface.desktop-mobile .desktop-icon-glyph {
	width: 44px;
	height: 44px;
	font-size: 32px;
}
.awtsmoos-desktop-surface.desktop-mobile .desktop-icon-label {
	max-width: 100%;
	font-size: 12px;
	line-height: 1.18;
	-webkit-line-clamp: 2;
}
.awtsmoos-desktop-surface.desktop-mobile .desktop-icon-badge,
.awtsmoos-desktop-surface.desktop-mobile::after {
	display: none !important;
}
.awtsmoos-desktop-surface.desktop-mobile .desktop-marquee {
	display: none !important;
}
.awtsmoos-desktop-surface.desktop-mobile .contextMenu {
	min-width: 0;
	font-size: 16px;
}
.awtsmoos-desktop-surface.desktop-mobile .contextMenu .menuItem {
	min-height: 48px;
}
@media (min-width: 520px) {
	.awtsmoos-desktop-surface.desktop-mobile {
		grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
	}
}
`;
