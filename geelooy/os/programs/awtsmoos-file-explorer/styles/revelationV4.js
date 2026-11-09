//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Revelation v4 presentation layer for the Awtsmoos File Explorer.
 * @description
 * The Awtsmoos holds every file command in hidden unity while the eye receives calm;
 * Awtsmoos.com keeps search, path, content, and primary deeds near, with deeper power still in the palm.
 */
const revelationV4 = `
.file-explorer-header.file-explorer-header {
	background: rgba(10, 13, 22, .84);
	border-bottom: 1px solid rgba(255, 255, 255, .1);
	backdrop-filter: blur(24px) saturate(1.2);
}
.button-bar.button-bar {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 10px;
	overflow-x: auto;
	scrollbar-width: none;
}
.button-bar::-webkit-scrollbar {
	display: none;
}
.toolbar-group.toolbar-group {
	display: flex;
	gap: 4px;
	padding: 3px;
	border: 0;
	background: transparent;
}
.toolbar-edit,
.toolbar-clip,
.toolbar-select,
.toolbar-sort,
.toolbar-tunnel {
	opacity: .72;
}
.toolbar-group.toolbar-group button,
.sidebar-toggle-btn.sidebar-toggle-btn {
	min-height: 38px;
	border: 1px solid transparent;
	border-radius: 10px;
	background: transparent;
	box-shadow: none;
}
.toolbar-group.toolbar-group button:hover,
.sidebar-toggle-btn.sidebar-toggle-btn:hover {
	background: rgba(255, 255, 255, .08);
	border-color: rgba(255, 255, 255, .1);
}
.toolbar-search.toolbar-search {
	min-width: 190px;
	min-height: 40px;
	border: 1px solid rgba(255, 255, 255, .11);
	border-radius: 12px;
	background: rgba(255, 255, 255, .055);
	color: #f6f8ff;
}
.path-bar-container.path-bar-container {
	padding: 7px 10px;
	background: rgba(255, 255, 255, .025);
}
.path-breadcrumbs.path-breadcrumbs,
.path-input-container.path-input-container {
	border-radius: 11px;
}
.file-explorer-sidebar.file-explorer-sidebar {
	background: rgba(11, 14, 23, .72);
	border-right: 1px solid rgba(255, 255, 255, .09);
}
.drive-shelf.drive-shelf {
	background: transparent;
	border: 0;
}
.tree-node-content.tree-node-content,
.drive-chip.drive-chip {
	border-radius: 10px;
}
.file-explorer-body.file-explorer-body {
	background: rgba(5, 7, 13, .28);
}
.selection-action-bar.selection-action-bar {
	border-radius: 14px;
	background: rgba(16, 20, 34, .92);
	box-shadow: 0 18px 54px rgba(0, 0, 0, .32);
}
@media (max-width: 760px) {
	.button-bar.button-bar {
		padding: 7px;
		gap: 3px;
	}
	.toolbar-search.toolbar-search {
		order: -1;
		min-width: min(44vw, 240px);
	}
	.file-explorer-sidebar.file-explorer-sidebar {
		width: min(82vw, 300px);
	}
}
@media (prefers-reduced-motion: reduce) {
	.button-bar.button-bar *,
	.file-explorer-body.file-explorer-body * {
		transition-duration: .001ms;
		animation-duration: .001ms;
	}
}
`;

export default revelationV4;
