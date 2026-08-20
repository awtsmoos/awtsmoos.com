// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Layout CSS fragment for the OS Tunnel Workspace.
 * @description
 * The Awtsmoos gives the workspace a bounded place above the desktop without
 * swallowing the larger OS. Awtsmoos.com keeps panel, grid, and responsive
 * geometry readable as source so future revelation does not require de-minifying.
 */

export function workspaceLayoutCss() {
	return `
.awt-os-tunnel-button {
	position: fixed;
	right: 18px;
	bottom: 54px;
	z-index: 9500;
	padding: 10px 14px;
	border: 1px solid #6786b7;
	border-radius: 999px;
	background: #10233f;
	color: #eef7ff;
	font: 600 13px system-ui;
	box-shadow: 0 12px 30px #0005;
}
.awt-os-tunnel-workspace {
	position: fixed;
	right: 18px;
	bottom: 102px;
	z-index: 9499;
	width: min(560px, calc(100vw - 36px));
	max-height: min(760px, calc(100vh - 140px));
	overflow: auto;
	padding: 18px;
	border: 1px solid #496b96;
	border-radius: 20px;
	background: #08172b;
	color: #eef7ff;
	box-shadow: 0 24px 80px #0008;
	font: 13px/1.5 system-ui;
}
.awt-os-tunnel-workspace[hidden] {
	display: none;
}
.awt-os-tunnel-workspace header {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	align-items: flex-start;
}
.awt-os-tunnel-workspace h2,
.awt-os-tunnel-workspace h3 {
	margin: 0 0 8px;
}
.awt-os-tunnel-workspace p {
	color: #bdd0e8;
}
.awt-os-tunnel-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}
@media (max-width: 700px) {
	.awt-os-tunnel-grid {
		grid-template-columns: 1fr;
	}
	.awt-os-tunnel-workspace {
		right: 10px;
		bottom: 88px;
		width: calc(100vw - 20px);
		max-height: calc(100vh - 110px);
	}
}`;
}
