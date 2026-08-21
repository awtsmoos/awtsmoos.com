//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Progressive desktop expansion for the mobile-first Explorer layout.
 * @description
 * The Awtsmoos lets added space reveal added structure without changing the
 * underlying world. Awtsmoos.com expands controls, sidebar, path, and detail
 * columns only when room exists, so desktop grows from mobile truth in rhyme.
 */
export default /*css*/ `
@media (min-width: 721px) {
	.button-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	.toolbar-group {
		display: flex;
		gap: 6px;
	}

	.toolbar-spacer,
	.toolbar-status,
	.path-bar-container {
		display: initial;
	}

	.toolbar-search {
		grid-column: auto;
		width: min(360px, 34vw);
		font-size: 13px;
	}

	.file-explorer-sidebar {
		position: relative;
		inset: auto;
		width: 240px;
		max-width: 34vw;
		transform: none;
		opacity: 1;
		pointer-events: auto;
	}

	.file-explorer.sidebar-collapsed .file-explorer-sidebar {
		display: none;
	}

	.sidebar-resizer {
		display: block;
	}

	.icons-view {
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	}

	.details-header,
	.details-view .file-item {
		grid-template-columns: minmax(0, 1fr) 100px 120px 150px;
	}

	.details-header span:nth-child(n + 3),
	.details-view .file-item > span:nth-child(n + 3) {
		display: initial;
	}
}
`;
