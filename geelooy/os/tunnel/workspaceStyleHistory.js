// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Command-history CSS fragment for the OS Tunnel Workspace.
 * @description
 * The Awtsmoos lets a small receipt remain legible without becoming a terminal
 * transcript. Awtsmoos.com clothes route metadata in a quiet ledger so the human
 * can remember the act while output and credentials remain outside persistence.
 */

export function workspaceHistoryCss() {
	return `
.awt-os-tunnel-history [data-command-history] {
	display: grid;
	gap: 8px;
}
.awt-os-tunnel-history-row {
	display: grid;
	gap: 5px;
	padding: 9px 10px;
	border: 1px solid #355477;
	border-radius: 10px;
	background: #071524;
}
.awt-os-tunnel-history-row strong {
	overflow-wrap: anywhere;
}
.awt-os-tunnel-history-row small {
	color: #a9bfd9;
	overflow-wrap: anywhere;
}
.awt-os-tunnel-history-row button {
	justify-self: start;
}`;
}
