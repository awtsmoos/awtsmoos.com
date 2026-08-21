//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Touch, focus, loading, and breadcrumb interaction rules for File Explorer.
 * @description
 * The Awtsmoos lets every tap and keypress reveal state without visual noise;
 * Awtsmoos.com keeps focus visible, touch highlights quiet, breadcrumbs scrollable,
 * and loading light delegated to the shared motion vessel so interaction may rhyme.
 */
export default /*css*/ `
.file-explorer button,
.file-explorer [role="button"],
.contextMenu .menuItem {
	-webkit-tap-highlight-color: transparent;
	touch-action: manipulation;
}

.file-explorer button:focus-visible,
.file-explorer [role="button"]:focus-visible,
.file-explorer input:focus-visible,
.contextMenu .menuItem:focus-visible {
	outline: 2px solid var(--awt-cyan);
	outline-offset: 2px;
}

.awtsmoos-breadcrumb {
	display: flex;
	align-items: center;
	gap: 5px;
	margin: 5px 0;
	padding: 6px;
	overflow-x: auto;
	white-space: nowrap;
	scrollbar-width: none;
	overscroll-behavior-inline: contain;
	background: rgba(2, 12, 25, .55);
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius);
}

.awtsmoos-breadcrumb::-webkit-scrollbar {
	display: none;
}

.breadcrumb-segment {
	flex: 0 0 auto;
	min-height: 38px;
	padding: 7px 11px;
	border-radius: 999px;
}

.breadcrumb-segment:disabled {
	opacity: 1;
	background: linear-gradient(135deg, rgba(92, 246, 255, .24), rgba(82, 255, 184, .12));
	color: white;
}

.breadcrumb-separator {
	color: var(--awt-cyan);
	font-weight: 900;
}

.toolbar-busy,
.file-explorer[data-loading="yes"] .file-explorer-frame {
	position: relative;
	overflow: hidden;
}

.toolbar-busy::after,
.file-explorer[data-loading="yes"] .file-explorer-frame::after {
	content: "";
	position: absolute;
	inset: 0;
	pointer-events: none;
	background: linear-gradient(90deg, transparent, rgba(92, 246, 255, .16), transparent);
}

@media (hover: hover) and (pointer: fine) {
	.toolbar-action:hover,
	.nav-btn:hover,
	.sidebar-toggle-btn:hover,
	.breadcrumb-segment:hover:not(:disabled) {
		transform: translateY(-1px);
	}
}
`;
