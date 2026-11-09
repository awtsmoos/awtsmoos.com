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
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile,
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile * {
	box-sizing: border-box;
	-webkit-tap-highlight-color: transparent;
}
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	grid-auto-rows: minmax(88px, auto);
	align-content: start;
	align-items: stretch;
	gap: 12px;
	width: 100vw;
	max-width: 100vw;
	min-width: 0;
	min-height: 100%;
	padding: calc(var(--desktop-safe-top, 10px) + 16px) 12px calc(var(--desktop-safe-bottom, 82px) + 14px);
	overflow-y: auto;
	overflow-x: hidden;
}
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile .desktop-icon.desktop-icon {
	position: relative;
	left: auto;
	top: auto;
	transform: none;
	width: 100%;
	min-width: 0;
	min-height: 88px;
	margin: 0;
	padding: 10px 8px;
	border-radius: 18px;
	touch-action: manipulation;
}
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile .desktop-icon.desktop-icon:hover {
	transform: none;
}
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile .desktop-icon.desktop-icon:active {
	transform: scale(0.97);
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
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile .desktop-icon-badge.desktop-icon-badge,
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile::after {
	display: none;
}
.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile .desktop-marquee.desktop-marquee {
	display: none;
}
.awtsmoos-desktop-surface.desktop-mobile .contextMenu {
	min-width: 0;
	font-size: 16px;
}
.awtsmoos-desktop-surface.desktop-mobile .contextMenu .menuItem {
	min-height: 48px;
}
@media (min-width: 520px) {
	.awtsmoos-desktop-surface.awtsmoos-desktop-surface.desktop-mobile.desktop-mobile {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}
`;
