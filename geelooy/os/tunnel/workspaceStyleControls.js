// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Form and content CSS fragment for the OS Tunnel Workspace.
 * @description
 * The Awtsmoos gives routes, files, commands, and peer controls distinct vessels.
 * Awtsmoos.com keeps focus, disabled authority, text previews, and terminal output
 * visually legible so the human never confuses available power with unavailable power.
 */

export function workspaceControlsCss() {
	return `
.awt-os-tunnel-workspace label {
	display: grid;
	gap: 6px;
	margin: 10px 0;
}
.awt-os-tunnel-workspace input,
.awt-os-tunnel-workspace select,
.awt-os-tunnel-workspace textarea {
	box-sizing: border-box;
	width: 100%;
	padding: 9px 11px;
	border: 1px solid #45658b;
	border-radius: 10px;
	background: #071020;
	color: #fff;
	font: inherit;
}
.awt-os-tunnel-workspace textarea {
	min-height: 68px;
	resize: vertical;
}
.awt-os-tunnel-workspace button {
	padding: 8px 11px;
	border: 1px solid #5476a2;
	border-radius: 10px;
	background: #183656;
	color: #fff;
	font: inherit;
	cursor: pointer;
}
.awt-os-tunnel-workspace button:hover:not(:disabled),
.awt-os-tunnel-workspace button:focus-visible {
	border-color: #8dc2ff;
	background: #21496f;
	outline: none;
}
.awt-os-tunnel-workspace button:disabled {
	opacity: .45;
	cursor: not-allowed;
}
.awt-os-tunnel-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin: 10px 0;
}
.awt-os-tunnel-route {
	display: block;
	padding: 8px;
	border-radius: 9px;
	background: #06101d;
	color: #8ce7ff;
	overflow-wrap: anywhere;
}
.awt-os-tunnel-files {
	display: grid;
	gap: 6px;
	max-height: 190px;
	overflow: auto;
}
.awt-os-tunnel-file {
	text-align: left;
}
.awt-os-tunnel-preview,
.awt-os-tunnel-output {
	max-height: 240px;
	overflow: auto;
	padding: 12px;
	border-radius: 10px;
	background: #030912;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}
.awt-os-tunnel-status {
	color: #aee8ff;
}
.awt-os-tunnel-status[data-state="error"] {
	color: #ffb4c9;
}
.awt-os-tunnel-peer {
	padding: 10px;
	border: 1px solid #355477;
	border-radius: 12px;
	background: #0b2038;
}`;
}
