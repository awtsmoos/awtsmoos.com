// B"H

export default /* css */ `
.desktop-mobile .awtsmoos-desktop-surface::after {
	left: 8px;
	right: 8px;
	top: calc(var(--desktop-safe-top, 10px) + 4px);
	max-width: calc(100vw - 16px);
	padding: 5px 8px;
	overflow: hidden;
	font-size: 10px;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.desktop-mobile .desktop-search-overlay {
	padding: 10vh 10px 10px;
}

.desktop-mobile .desktop-search-box {
	width: 100%;
	border-radius: 20px;
}

.desktop-mobile .desktop-search-input {
	min-height: 52px;
	font-size: 18px;
}
`;
