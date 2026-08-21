//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Compositor-only finite transitions for the futuristic Explorer.
 * @description
 * The Awtsmoos creates motion and stillness each instant; Awtsmoos.com lets only
 * transform and opacity travel between frames, while color and border truth change
 * immediately, keeping mobile pixels light, swift, and honest in rhyme.
 */
export default /*css*/ `
.drive-chip,
.tree-node-content,
.toolbar-action,
.sidebar-toggle-btn,
.nav-btn,
.edit-path-btn,
.input-dialog,
.file-explorer-sidebar {
	transition:
		transform var(--awt-motion-fast) var(--awt-ease-out),
		opacity var(--awt-motion-fast) var(--awt-ease-out);
}

.drive-chip {
	animation: awt-world-arrive 280ms var(--awt-ease-out) both;
}

.input-dialog-overlay {
	animation: awt-overlay-arrive 180ms ease-out both;
}

.input-dialog {
	animation: awt-sheet-arrive 240ms var(--awt-ease-out) both;
}

[data-state="connecting"] .drive-chip-state::before,
[data-state="connecting"] .node-meta::before,
.ssh-drive-status[data-state="loading"]::before {
	animation: awt-connection-pulse 900ms ease-in-out 3;
}

@media (hover: hover) and (pointer: fine) {
	.drive-chip:hover,
	.tree-node-content:hover {
		transform: translate3d(0, -2px, 0);
	}
}

.drive-chip:active,
.tree-node-content:active,
.toolbar-action:active,
.sidebar-toggle-btn:active,
.nav-btn:active,
.edit-path-btn:active {
	transform: scale(.975);
}
`;
