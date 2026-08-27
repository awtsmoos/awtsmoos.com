//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Responsive details rows and empty-state vessels for futuristic Explorer views.
 * @description
 * The Awtsmoos lets dense metadata reveal itself only when the screen has room;
 * Awtsmoos.com keeps the phone view legible with two essential columns, while
 * larger worlds unfold additional detail without overflow, all measured in rhyme.
 */
export default /*css*/ `
.details-view {
	display: grid;
	gap: 6px;
	min-width: 0;
	padding: 6px;
}

.details-header,
.details-view .file-item {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 76px;
	align-items: center;
	gap: 6px;
	min-width: 0;
	min-height: 46px;
	padding: 7px 8px;
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-sm);
	background: rgba(255, 255, 255, .055);
	color: var(--awt-text);
}

.details-header {
	position: sticky;
	top: 0;
	z-index: 2;
	background: rgba(8, 34, 58, .94);
	font: 790 10px var(--awt-font);
	letter-spacing: .04em;
	text-transform: uppercase;
}

.details-name,
.details-view .file-name {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.details-header span:nth-child(n + 3),
.details-view .file-item > span:nth-child(n + 3) {
	display: none;
}

.empty-folder-state,
.remote-folder-state,
.semantic-empty-state,
.semantic-error-state {
	display: grid;
	grid-template-columns: 1fr;
	gap: 8px;
	align-items: start;
	min-width: 0;
	padding: 14px;
	overflow: hidden;
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-lg);
	background: rgba(255, 255, 255, .045);
	color: var(--awt-muted);
}

.state-glyph {
	font-size: 28px;
}

.empty-state-title {
	min-width: 0;
	color: var(--awt-text);
	font-weight: 800;
	overflow-wrap: anywhere;
}

.empty-state-detail {
	min-width: 0;
	line-height: 1.4;
	overflow-wrap: anywhere;
}

@media (min-width: 721px) {
	.details-header,
	.details-view .file-item {
		grid-template-columns: minmax(190px, 1.4fr) 92px minmax(118px, .8fr) 96px 110px;
	}

	.details-header span:nth-child(n + 3),
	.details-view .file-item > span:nth-child(n + 3) {
		display: initial;
	}

	.empty-folder-state,
	.remote-folder-state,
	.semantic-empty-state,
	.semantic-error-state {
		grid-template-columns: auto minmax(0, 1fr);
		gap: 6px 10px;
	}

	.state-glyph {
		grid-row: 1 / 3;
	}
}
`;
