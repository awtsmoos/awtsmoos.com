//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reduced-motion covenant for every animated Explorer vessel.
 * @description
 * The Awtsmoos is present equally in motion and rest; Awtsmoos.com therefore
 * preserves state truth when a user asks the interface to remain still, removing
 * decorative travel without removing focus, connection, or semantic rhyme.
 */
export default /*css*/ `
@media (prefers-reduced-motion: reduce) {
	.drive-chip.drive-chip,
	.tree-node-content.tree-node-content,
	.toolbar-action.toolbar-action,
	.sidebar-toggle-btn.sidebar-toggle-btn,
	.nav-btn.nav-btn,
	.edit-path-btn.edit-path-btn,
	.input-dialog.input-dialog,
	.input-dialog-overlay.input-dialog-overlay,
	.file-explorer-sidebar.file-explorer-sidebar,
	.drive-chip-state.drive-chip-state::before,
	.node-meta.node-meta::before,
	.ssh-drive-status.ssh-drive-status::before {
		animation: none;
		transition-duration: .001ms;
		scroll-behavior: auto;
	}
}
`;
