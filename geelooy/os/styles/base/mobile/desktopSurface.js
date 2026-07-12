// B"H

export default /* css */ `
.desktop-mobile,
.desktop-mobile * {
	-webkit-tap-highlight-color: transparent;
}

.desktop-mobile .awtsmoos-desktop-surface {
	display: flex !important;
	flex-direction: column !important;
	align-items: center !important;
	gap: 14px !important;
	min-height: calc(100svh + 560px) !important;
	padding: calc(var(--desktop-safe-top, 10px) + 58px) 10px 90px !important;
	overflow: visible !important;
}

.desktop-mobile .desktop-icon {
	position: relative !important;
	left: auto !important;
	top: auto !important;
	transform: none !important;
	width: min(232px, calc(100vw - 42px)) !important;
	min-height: 128px !important;
	margin: 0 auto !important;
	padding: 12px 14px !important;
	touch-action: manipulation !important;
}

.desktop-mobile .desktop-icon:hover {
	transform: none !important;
}

.desktop-mobile .desktop-icon-glyph {
	width: 58px;
	height: 58px;
	font-size: 44px;
}

.desktop-mobile .desktop-icon-label {
	max-width: 100%;
	font-size: 16px;
	line-height: 1.15;
}

.desktop-mobile .desktop-icon-badge {
	top: 10px;
	right: 12px;
	padding: 4px 9px;
	font-size: 12px;
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
`;
