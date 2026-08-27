//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared visual state language for every local and remote Explorer world.
 * @description
 * The Awtsmoos renews connection and disconnection without confusing one for the
 * other; Awtsmoos.com gives each truthful state a stable marker while words and
 * ARIA remain authoritative, so color assists rather than rules the rhyme.
 */
export default /*css*/ `
.drive-chip-state,
.node-meta {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}

.drive-chip-state::before,
.node-meta::before {
	content: "";
	flex: 0 0 auto;
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: var(--awt-faint);
}

[data-state="connected"] .drive-chip-state::before,
[data-state="connected"] .node-meta::before {
	background: var(--awt-green);
	box-shadow: 0 0 10px rgba(82, 255, 184, .5);
}

[data-state="connecting"] .drive-chip-state::before,
[data-state="connecting"] .node-meta::before {
	background: var(--awt-cyan);
}

[data-state="needs-credential"] .drive-chip-state::before,
[data-state="needs-credential"] .node-meta::before,
[data-state="snapshot"] .drive-chip-state::before,
[data-state="snapshot"] .node-meta::before {
	background: var(--awt-gold);
}

[data-state="error"] .drive-chip-state::before,
[data-state="error"] .node-meta::before {
	background: var(--awt-danger);
}

[data-state="offline"] .drive-chip-state::before,
[data-state="offline"] .node-meta::before {
	background: var(--awt-faint);
}

.drive-chip[data-state="error"],
.drive-node[data-state="error"] .tree-node-content {
	border-color: rgba(255, 102, 133, .56);
}

.drive-chip[data-state="offline"],
.drive-node[data-state="offline"] .tree-node-content {
	opacity: .72;
}

.drive-chip[data-state="snapshot"] {
	border-color: rgba(255, 209, 102, .34);
}

.drive-chip[data-state="needs-credential"],
.drive-node[data-state="needs-credential"] .tree-node-content {
	border-style: dashed;
	border-color: rgba(255, 209, 102, .56);
}
`;
