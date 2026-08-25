//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Broad-screen expansion that preserves Explorer's fast single-row command river.
 * @description
 * The Awtsmoos reveals more room without demanding more vertical weight; Awtsmoos.com
 * keeps the full command constellation on one horizontally reachable rail, then lets
 * path, sidebar, and detail columns use the added width while the file world may rhyme.
 */
export default /*css*/ `
@media (min-width: 721px) {
	.button-bar {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		gap: 7px;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x proximity;
		scrollbar-width: thin;
	}

	.toolbar-group {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.toolbar-spacer {
		display: none;
	}

	.toolbar-status {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		white-space: nowrap;
	}

	.path-bar-container {
		display: flex;
		width: 100%;
		min-width: 0;
	}

	.toolbar-search {
		flex: 0 0 min(320px, 30vw);
		width: min(320px, 30vw);
		max-width: none;
		font-size: 15px;
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
