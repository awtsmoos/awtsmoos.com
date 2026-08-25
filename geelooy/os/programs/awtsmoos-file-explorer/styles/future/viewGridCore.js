//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile-first core file-card geometry for the futuristic Awtsmoos Explorer.
 * @description
 * The Awtsmoos lets each file appear as a readable spark with touch-first proportions;
 * Awtsmoos.com keeps names, metadata, selection, and fine-pointer lift inside one
 * compact card law while desktop expansion waits in its own vessel and rhyme.
 */
export default /*css*/ `
.icons-view {
	display: grid;
	grid-template-columns: 1fr;
	gap: 8px;
	align-content: start;
	padding: 7px;
}

.icons-view .file-item {
	position: relative;
	min-height: 84px;
	display: grid;
	grid-template-columns: 54px minmax(0, 1fr);
	grid-template-rows: auto auto;
	align-items: center;
	column-gap: 10px;
	padding: 10px;
	border: 1px solid rgba(154, 216, 255, .16);
	border-radius: var(--awt-radius-lg);
	background: linear-gradient(145deg, rgba(31, 92, 164, .20), rgba(7, 23, 41, .50));
	color: var(--awt-text);
	box-shadow: inset 0 1px rgba(255, 255, 255, .07);
	overflow: hidden;
	contain: layout paint style;
}

.file-item .icon-img {
	grid-row: 1 / 3;
	width: 46px !important;
	height: 46px !important;
	margin-inline: auto;
	filter: drop-shadow(0 8px 12px rgba(0, 0, 0, .30));
}

.file-name {
	min-width: 0;
	font-size: 15px;
	line-height: 1.16;
	color: inherit;
	font-weight: 800;
	overflow-wrap: anywhere;
	text-align: left;
}

.item-meta {
	justify-self: start;
	max-width: 100%;
	display: inline-flex;
	align-items: center;
	border: 1px solid rgba(154, 216, 255, .22);
	border-radius: 999px;
	padding: 3px 7px;
	color: var(--awt-muted);
	font-size: 9px;
	line-height: 1;
	text-transform: uppercase;
	background: rgba(4, 17, 31, .36);
}

.mount-badge {
	max-width: 48%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	border-color: var(--awt-line2) !important;
	background: rgba(4, 17, 31, .55) !important;
	color: var(--awt-cyan) !important;
}

.file-item.selected,
.file-explorer [aria-selected="true"] {
	background: linear-gradient(135deg, rgba(58, 167, 255, .55), rgba(82, 255, 184, .22)) !important;
	border-color: var(--awt-cyan) !important;
	color: white !important;
}

.file-item:focus-visible {
	outline: 2px solid var(--awt-gold);
	outline-offset: -3px;
}

@media (hover: hover) and (pointer: fine) {
	.icons-view .file-item:hover {
		transform: translateY(-2px);
		border-color: var(--awt-line2);
		background: linear-gradient(180deg, rgba(92, 246, 255, .15), rgba(58, 167, 255, .11));
	}
}
`;
