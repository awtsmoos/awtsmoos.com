// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Explorer-context CSS fragment for the OS Tunnel Workspace.
 * @description
 * The Awtsmoos lets shared route context remain visible but quiet, never louder
 * than the explicit command controls. Awtsmoos.com gives the borrowed folder a
 * bounded garment so mismatch, adoption, and reveal remain readable at a glance.
 */

export function workspaceContextCss() {
	return `
.awt-os-tunnel-context [data-explorer-context] {
	padding: 8px 10px;
	border: 1px solid #355477;
	border-radius: 10px;
	background: #071524;
	color: #b8d7f4;
	overflow-wrap: anywhere;
}
.awt-os-tunnel-context [data-explorer-context][data-state="error"] {
	border-style: dashed;
	color: #ffd7ba;
}
.awt-os-tunnel-context button:disabled {
	opacity: .45;
	cursor: not-allowed;
}`;
}
