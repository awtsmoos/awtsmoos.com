//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stable touch-first cards for local, tunnel, SSH, preview, and virtual worlds.
 * @description
 * The Awtsmoos lets every mounted world wear a luminous but lightweight identity;
 * Awtsmoos.com keeps dimensions fixed, avoids permanent compositor promotion, and
 * lets shared state plus finite motion reveal connection without exhausting the rhyme.
 */
export default /*css*/ `
.drive-chip {
	position: relative;
	flex: 0 0 154px;
	min-width: 0;
	min-height: 78px;
	display: grid;
	grid-template-columns: 28px minmax(0, 1fr);
	grid-template-rows: auto auto auto;
	column-gap: 8px;
	align-content: center;
	text-align: left;
	scroll-snap-align: start;
	contain: layout paint style;
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius);
	background: linear-gradient(145deg, rgba(20, 70, 109, .72), rgba(7, 27, 48, .84));
	color: var(--awt-text);
	padding: 9px 10px;
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
	background: linear-gradient(115deg, rgba(255, 255, 255, .10), transparent 34%, rgba(92, 246, 255, .06));
	opacity: .72;
}

.drive-chip-icon {
	grid-row: 1 / span 3;
	align-self: center;
	font-size: 22px;
	text-shadow: 0 0 8px rgba(92, 246, 255, .24);
}

.drive-chip-label,
.drive-chip-meta,
.drive-chip-state {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.drive-chip-label {
	font-size: 12px;
	font-weight: 800;
}

.drive-chip-meta,
.drive-chip-state {
	font-size: 9px;
	line-height: 1.35;
	color: var(--awt-muted);
}

.drive-chip:focus-visible {
	outline: 2px solid var(--awt-cyan);
	outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
	.drive-chip:hover {
		border-color: var(--awt-line2);
	}
}

@media (min-width: 721px) {
	.drive-chip {
		flex-basis: 188px;
		min-height: 82px;
		padding: 10px 12px;
	}
}
`;
