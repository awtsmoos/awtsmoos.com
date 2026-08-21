//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile Explorer spatial layout for sidebar, content, details, and safe actions.
 * @description
 * The Awtsmoos lets narrow space become intentional space; Awtsmoos.com slides
 * locations in as a lightweight layer, keeps file content fluid, and anchors
 * selection actions above the device safe area so every reachable vessel may rhyme.
 */
export default /*css*/ `
.file-explorer-main,
.file-explorer-content {
	position: relative;
}

.file-explorer-sidebar {
	position: absolute;
	z-index: 20;
	inset: 4px auto 4px 4px;
	width: min(82vw, 310px);
	max-width: 310px;
	transform: translate3d(-108%, 0, 0);
	opacity: 0;
	pointer-events: none;
}

.file-explorer:not(.sidebar-collapsed) .file-explorer-sidebar {
	transform: translate3d(0, 0, 0);
	opacity: 1;
	pointer-events: auto;
}

.sidebar-resizer {
	display: none;
}

.file-explorer-body {
	min-height: 180px;
	margin: 0;
}

.icons-view {
	grid-template-columns: 1fr;
	gap: 8px;
	padding: 7px;
}

.details-view {
	min-width: 0;
}

.details-header,
.details-view .file-item {
	grid-template-columns: minmax(0, 1fr) 76px;
}

.details-header span:nth-child(n + 3),
.details-view .file-item > span:nth-child(n + 3) {
	display: none;
}

.selection-action-bar {
	left: 8px;
	right: 8px;
	bottom: calc(env(safe-area-inset-bottom, 0px) + 10px);
	transform: none;
	flex-wrap: wrap;
	border-radius: var(--awt-radius-lg);
}

@media (hover: none), (pointer: coarse) {
	.file-explorer-sidebar,
	.input-dialog-overlay,
	.file-explorer-header,
	.drive-shelf {
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
}
`;
