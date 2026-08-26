//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Readable touch-first cards for local, tunnel, SSH, preview, and virtual worlds.
 * @description
 * The Awtsmoos lets every mounted world wear luminous identity without becoming
 * tiny decoration. Awtsmoos.com keeps card geometry stable, raises readable type,
 * and leaves state motion to compositor-friendly vessels so each doorway may rhyme.
 */
export default /*css*/ `
.drive-chip {
	position: relative;
	flex: 0 0 176px;
	min-width: 0;
	min-height: 92px;
	display: grid;
	grid-template-columns: 34px minmax(0, 1fr);
	grid-template-rows: auto auto auto;
	column-gap: 10px;
	row-gap: 3px;
	align-content: center;
	text-align: left;
	scroll-snap-align: start;
	contain: layout paint style;
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius);
	background: linear-gradient(145deg, rgba(20, 70, 109, .76), rgba(7, 27, 48, .88));
	color: var(--awt-text);
	padding: 11px 12px;
	cursor: pointer;
	touch-action: manipulation;
	-webkit-tap-highlight-color: transparent;
}

.drive-chip::after {
	content: "";
	position: absolute;
	inset: 0;
	pointer-events: none;
	border-radius: inherit;
	background: linear-gradient(115deg, rgba(255, 255, 255, .12), transparent 36%, rgba(92, 246, 255, .055));
	opacity: .7;
}

.drive-chip-icon {
	grid-row: 1 / span 3;
	align-self: center;
	font-size: 28px;
	line-height: 1;
	text-shadow: 0 0 10px rgba(92, 246, 255, .26);
}

.drive-chip-label,
.drive-chip-meta,
.drive-chip-state {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.drive-chip-label {
	font: 800 var(--awt-text-md)/1.2 var(--awt-font);
	white-space: nowrap;
}

.drive-chip-meta {
	font: 560 var(--awt-text-xs)/1.35 var(--awt-font);
	color: var(--awt-muted);
	white-space: nowrap;
}

.drive-chip:focus-visible {
	outline: 2px solid var(--awt-cyan);
	outline-offset: 3px;
}

@media (hover: hover) and (pointer: fine) {
	.drive-chip:hover {
		border-color: var(--awt-line2);
	}
}

@media (min-width: 721px) {
	.drive-chip {
		flex-basis: 214px;
		min-height: 96px;
		padding: 12px 14px;
	}
}
`;
