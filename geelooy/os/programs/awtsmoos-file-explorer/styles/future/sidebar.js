//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile-first location tree for local, tunnel, SSH, and virtual worlds.
 * @description
 * The Awtsmoos lets hierarchy become a calm map instead of a cramped rail;
 * Awtsmoos.com keeps broad touch rows, readable state capsules, and static luminous
 * depth here while remote truth remains in its shared descriptor vessel in rhyme.
 */
export default /*css*/ `
.file-explorer-sidebar {
	margin: 0;
	padding: 8px;
	overflow: auto;
	overscroll-behavior: contain;
	background: linear-gradient(180deg, rgba(8, 27, 49, .97), rgba(4, 15, 28, .98));
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-lg);
	color: var(--awt-text);
	box-shadow: var(--awt-shadow);
}

.sidebar-heading {
	padding: 8px 10px 11px;
	color: var(--awt-muted);
	font: 820 var(--awt-text-xs)/1 var(--awt-font);
	letter-spacing: .14em;
	text-transform: uppercase;
}

.tree-root {
	margin: 0;
	padding: 0;
	list-style: none;
	display: grid;
	gap: 6px;
}

.tree-node-content {
	width: 100%;
	min-height: var(--awt-touch);
	display: grid;
	grid-template-columns: 16px 32px minmax(0, 1fr);
	align-items: center;
	gap: 9px;
	padding: 8px 10px;
	border: 1px solid transparent;
	border-radius: var(--awt-radius-sm);
	background: rgba(255, 255, 255, .04);
	color: var(--awt-text);
	text-align: left;
	cursor: pointer;
	touch-action: manipulation;
}

.tree-node-content.selected {
	background: linear-gradient(90deg, rgba(58, 167, 255, .30), rgba(82, 255, 184, .11));
	border-color: rgba(92, 246, 255, .42);
}

.node-provider-icon {
	font-size: 21px;
	text-align: center;
	text-shadow: 0 0 8px rgba(92, 246, 255, .24);
}

.node-copy {
	min-width: 0;
	display: grid;
	gap: 5px;
}

.node-name {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font: 780 var(--awt-text-sm)/1.2 var(--awt-font);
}

.node-meta {
	max-width: 100%;
}

@media (hover: hover) and (pointer: fine) {
	.tree-node-content:hover {
		background: rgba(58, 167, 255, .18);
		border-color: rgba(92, 246, 255, .28);
	}
}

@media (min-width: 721px) {
	.file-explorer-sidebar {
		margin: 0 0 6px 6px;
		padding: 7px;
	}

	.tree-node-content {
		min-height: 44px;
	}
}
`;
