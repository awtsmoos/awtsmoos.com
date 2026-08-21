//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Thumb-first toolbar and search geometry for narrow Explorer worlds.
 * @description
 * The Awtsmoos lets a small screen remain a complete vessel instead of a reduced
 * desktop. Awtsmoos.com gives the thumb broad targets and a full-width search path,
 * while decorative density withdraws until larger space reveals it in rhyme.
 */
export default /*css*/ `
.file-explorer-header {
	position: relative;
	z-index: 8;
	margin: 0;
}

.button-bar {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 6px;
	align-items: stretch;
}

.toolbar-group {
	display: contents;
}

.toolbar-spacer,
.toolbar-status {
	display: none;
}

.toolbar-action,
.sidebar-toggle-btn,
.nav-btn,
.edit-path-btn {
	min-width: 0;
	min-height: var(--awt-touch);
	padding: 6px 5px;
	border-radius: var(--awt-radius-sm);
	font-size: 11px;
	line-height: 1.1;
	white-space: normal;
	touch-action: manipulation;
}

.toolbar-search {
	grid-column: 1 / -1;
	width: 100%;
	max-width: none;
	min-height: var(--awt-touch);
	padding: 9px 13px;
	border-radius: var(--awt-radius);
	font-size: 16px;
}

.path-bar-container {
	display: none;
}
`;
