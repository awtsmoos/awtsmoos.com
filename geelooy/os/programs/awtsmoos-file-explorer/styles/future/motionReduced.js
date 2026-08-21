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
	.drive-chip,
	.tree-node-content,
	.toolbar-action,
	.sidebar-toggle-btn,
	.nav-btn,
	.edit-path-btn,
	.input-dialog,
	.input-dialog-overlay,
	.file-explorer-sidebar,
	.drive-chip-state::before,
	.node-meta::before,
	.ssh-drive-status::before {
		animation: none !important;
		transition-duration: .001ms !important;
		scroll-behavior: auto !important;
	}
}
`;
