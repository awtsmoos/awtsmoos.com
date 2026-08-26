//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Broad-screen expansion for futuristic Explorer file cards.
 * @description
 * The Awtsmoos lets added width become breathing room rather than heavier code;
 * Awtsmoos.com expands file sparks into centered desktop cards only beyond the mobile
 * threshold, leaving the touch-first core unchanged while larger worlds rhyme.
 */
export default /*css*/ `
@media (min-width: 721px) {
	.icons-view {
		grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
		gap: 12px;
		padding: 10px;
	}

	.icons-view .file-item {
		min-height: 136px;
		grid-template-columns: 1fr;
		grid-template-rows: auto auto auto;
		justify-items: center;
		padding: 13px 9px;
	}

	.file-item .icon-img {
		grid-row: auto;
		width: 58px !important;
		height: 58px !important;
	}

	.file-name {
		font-size: 14px;
		text-align: center;
	}

	.item-meta {
		justify-self: center;
	}
}
`;
