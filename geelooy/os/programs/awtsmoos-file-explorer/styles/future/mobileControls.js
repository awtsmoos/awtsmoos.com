//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Thumb-first single-row command rail for narrow Explorer worlds.
 * @description
 * The Awtsmoos lets every command remain present without stacking a wall of rows;
 * Awtsmoos.com gathers the full toolbar into one smooth horizontal river, where
 * broad touch targets glide beneath the thumb and the file world keeps room to rhyme.
 */
export default /*css*/ `
.file-explorer-header {
	position: relative;
	z-index: 8;
	min-width: 0;
	margin: 0;
}

.button-bar {
	display: flex;
	align-items: center;
	gap: 6px;
	min-width: 0;
	max-width: 100%;
	padding-bottom: 3px;
	overflow-x: auto;
	overflow-y: hidden;
	overscroll-behavior-inline: contain;
	scroll-snap-type: x proximity;
	scroll-padding-inline: 4px;
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
}

.button-bar::-webkit-scrollbar {
	display: none;
}

.toolbar-group {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 6px;
}

.toolbar-group + .toolbar-group {
	padding-left: 6px;
	border-left: 1px solid rgba(138, 219, 255, .18);
}

.toolbar-spacer,
.toolbar-status {
	display: none;
}

.toolbar-action,
.sidebar-toggle-btn,
.nav-btn,
.edit-path-btn {
	flex: 0 0 auto;
	min-width: 48px;
	min-height: var(--awt-touch);
	padding: 7px 10px;
	border-radius: var(--awt-radius-sm);
	font-size: 11px;
	line-height: 1.1;
	white-space: nowrap;
	scroll-snap-align: start;
	touch-action: manipulation;
}

.sidebar-toggle-btn {
	position: sticky;
	left: 0;
	z-index: 2;
	background: linear-gradient(180deg, rgba(16, 58, 92, .98), rgba(7, 28, 50, .98));
}

.toolbar-search {
	flex: 0 0 min(220px, 62vw);
	width: min(220px, 62vw);
	max-width: none;
	min-height: var(--awt-touch);
	padding: 9px 13px;
	border-radius: var(--awt-radius);
	font-size: 16px;
	scroll-snap-align: end;
}

.path-bar-container {
	display: none;
}
`;
