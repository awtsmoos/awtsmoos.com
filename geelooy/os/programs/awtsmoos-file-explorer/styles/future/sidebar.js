//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile-first location tree for local, tunnel, SSH, and virtual worlds.
 * @description
 * The Awtsmoos lets hierarchy become a calm map rather than a cramped desktop rail;
 * Awtsmoos.com keeps broad touch rows and static luminous depth here while shared
 * remote-state truth lives in its own vessel, reducing paint and duplicated rhyme.
 */
export default /*css*/ `
.file-explorer-sidebar {
	margin: 0;
	padding: 8px;
	overflow: auto;
	overscroll-behavior: contain;
	background: linear-gradient(180deg, rgba(8, 27, 49, .96), rgba(4, 15, 28, .97));
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-lg);
	color: var(--awt-text);
	box-shadow: var(--awt-shadow);
}

.sidebar-heading {
	padding: 7px 9px 10px;
	color: var(--awt-muted);
	font: 820 10px var(--awt-font);
	letter-spacing: .14em;
	text-transform: uppercase;
}

.tree-root {
	margin: 0;
	padding: 0;
	list-style: none;
	display: grid;
	gap: 5px;
}

.tree-node-content {
	width: 100%;
	min-height: var(--awt-touch);
	display: grid;
	grid-template-columns: 16px 30px minmax(0, 1fr);
	align-items: center;
	gap: 8px;
	padding: 7px 9px;
	border: 1px solid transparent;
	border-radius: var(--awt-radius-sm);
	background: rgba(255, 255, 255, .035);
	color: var(--awt-text);
	text-align: left;
	cursor: pointer;
	touch-action: manipulation;
}

.tree-node-content.selected {
	background: linear-gradient(90deg, rgba(58, 167, 255, .28), rgba(82, 255, 184, .10));
	border-color: rgba(92, 246, 255, .38);
}

.node-provider-icon {
	text-shadow: 0 0 7px rgba(92, 246, 255, .24);
}

.node-copy {
	min-width: 0;
	display: grid;
	gap: 2px;
}

.node-name,
.node-meta {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.node-name {
	font: 760 12px var(--awt-font);
}

.node-meta {
	color: var(--awt-muted);
	font: 600 9px var(--awt-font);
}

@media (hover: hover) and (pointer: fine) {
	.tree-node-content:hover {
		background: rgba(58, 167, 255, .18);
		border-color: rgba(92, 246, 255, .25);
	}
}

@media (min-width: 721px) {
	.file-explorer-sidebar {
		margin: 0 0 6px 6px;
		padding: 7px;
	}

	.tree-node-content {
		min-height: 40px;
	}
}
`;
