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
.file-explorer-header {
	background: rgba(10, 13, 22, .84) !important;
	border-bottom: 1px solid rgba(255, 255, 255, .1) !important;
	backdrop-filter: blur(24px) saturate(1.2);
}
.button-bar {
	display: flex !important;
	align-items: center !important;
	gap: 6px !important;
	padding: 8px 10px !important;
	overflow-x: auto !important;
	scrollbar-width: none;
}
.button-bar::-webkit-scrollbar {
	display: none;
}
.toolbar-group {
	display: flex !important;
	gap: 4px !important;
	padding: 3px !important;
	border: 0 !important;
	background: transparent !important;
}
.toolbar-edit,
.toolbar-clip,
.toolbar-select,
.toolbar-sort,
.toolbar-tunnel {
	opacity: .72;
}
.toolbar-group button,
.sidebar-toggle-btn {
	min-height: 38px !important;
	border: 1px solid transparent !important;
	border-radius: 10px !important;
	background: transparent !important;
	box-shadow: none !important;
}
.toolbar-group button:hover,
.sidebar-toggle-btn:hover {
	background: rgba(255, 255, 255, .08) !important;
	border-color: rgba(255, 255, 255, .1) !important;
}
.toolbar-search {
	min-width: 190px !important;
	min-height: 40px !important;
	border: 1px solid rgba(255, 255, 255, .11) !important;
	border-radius: 12px !important;
	background: rgba(255, 255, 255, .055) !important;
	color: #f6f8ff !important;
}
.path-bar-container {
	padding: 7px 10px !important;
	background: rgba(255, 255, 255, .025) !important;
}
.path-breadcrumbs,
.path-input-container {
	border-radius: 11px !important;
}
.file-explorer-sidebar {
	background: rgba(11, 14, 23, .72) !important;
	border-right: 1px solid rgba(255, 255, 255, .09) !important;
}
.drive-shelf {
	background: transparent !important;
	border: 0 !important;
}
.tree-node-content,
.drive-chip {
	border-radius: 10px !important;
}
.file-explorer-body {
	background: rgba(5, 7, 13, .28) !important;
}
.selection-action-bar {
	border-radius: 14px !important;
	background: rgba(16, 20, 34, .92) !important;
	box-shadow: 0 18px 54px rgba(0, 0, 0, .32) !important;
}
@media (max-width: 760px) {
	.button-bar {
		padding: 7px !important;
		gap: 3px !important;
	}
	.toolbar-search {
		order: -1;
		min-width: min(44vw, 240px) !important;
	}
	.file-explorer-sidebar {
		width: min(82vw, 300px) !important;
	}
}
@media (prefers-reduced-motion: reduce) {
	.button-bar *,
	.file-explorer-body * {
		transition-duration: .001ms !important;
		animation-duration: .001ms !important;
	}
}
`;

export default revelationV4;
