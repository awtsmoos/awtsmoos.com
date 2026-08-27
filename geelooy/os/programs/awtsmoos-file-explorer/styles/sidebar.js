// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Explorer location rail for local, tunnel, SSH, preview, and virtual mounts.
 * @description The Awtsmoos gives every mounted world a readable place in the tree; Awtsmoos.com balances clarity and compactness so remote state can shine without noise.
 */
export default /*css*/ `
.file-explorer-sidebar {
	width: var(--sidebar-width);
	min-width: 210px;
	flex-shrink: 0;
	overflow: auto;
	padding: 8px 7px 16px;
	background: linear-gradient(#edf4ff, #d9e8fb);
	border-right: 1px solid #9fb4cf;
}

.file-explorer.sidebar-collapsed .file-explorer-sidebar {
	width: 0 !important;
	min-width: 0;
	padding: 0;
	border-right: 0;
	overflow: hidden;
}

.sidebar-heading {
	margin: 2px 4px 8px;
	font-size: 11px;
	font-weight: 700;
	color: #2f4f70;
	text-transform: uppercase;
	letter-spacing: .04em;
}

.file-explorer-sidebar ul {
	list-style: none;
	margin: 0;
	padding: 0;
}

.tree-node {
	margin: 2px 0;
}

.tree-node-content {
	width: 100%;
	display: grid;
	grid-template-columns: 14px 22px minmax(0, 1fr);
	align-items: center;
	gap: 5px;
	padding: 5px 6px;
	text-align: left;
	border: 1px solid transparent;
	border-radius: 4px;
	background: transparent;
	cursor: pointer;
}

.tree-node-content:hover,
.tree-node-content:focus-visible,
.tree-node-content.selected {
	outline: none;
	background: rgba(255, 255, 255, .78);
	border-color: #7da2cf;
}

.toggle-icon,
.node-provider-icon {
	display: inline-grid;
	place-items: center;
}

.toggle-icon {
	width: 14px;
	height: 14px;
}

.toggle-icon svg {
	width: 9px;
	height: 9px;
}

.node-provider-icon {
	width: 22px;
	height: 22px;
	font-size: 17px;
}

.node-copy {
	display: grid;
	min-width: 0;
}

.node-name,
.node-meta {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.node-name {
	font-weight: 700;
	color: #183a5c;
}

.node-meta {
	font-size: 9px;
	color: #58718c;
}

.tree-node.mount-tunnel[data-state="connected"] .tree-node-content,
.tree-node.mount-ssh[data-state="connected"] .tree-node-content {
	border-left: 4px solid #4e9a51;
}

.tree-node.mount-preview .node-name {
	color: #6d28d9;
}
`;
