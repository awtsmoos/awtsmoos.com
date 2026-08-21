//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile-first connected-world rail and live-state capsule.
 * @description
 * The Awtsmoos keeps distant worlds visible even on the narrowest screen;
 * Awtsmoos.com gives the rail touch-native snap motion while status stays compact,
 * readable, and separate from individual drive garments in rhyme.
 */
export default /*css*/ `
.drive-shelf {
	display: flex;
	align-items: stretch;
	gap: 7px;
	margin: 4px 0 6px;
	padding: 7px;
	overflow-x: auto;
	overflow-y: hidden;
	max-width: 100%;
	scroll-snap-type: x proximity;
	scroll-padding-inline: 7px;
	scrollbar-width: none;
	overscroll-behavior-inline: contain;
	-webkit-overflow-scrolling: touch;
}

.drive-shelf::-webkit-scrollbar {
	display: none;
}

.drive-shelf-status {
	flex: 0 0 auto;
	align-self: center;
	min-height: 34px;
	display: inline-flex;
	align-items: center;
	gap: 7px;
	padding: 7px 10px;
	border-radius: 999px;
	background: rgba(2, 14, 27, .66);
	border: 1px solid var(--awt-line);
	color: var(--awt-muted);
	font-size: 10px;
	font-weight: 760;
	white-space: nowrap;
}

.drive-shelf-status::before {
	content: "";
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: var(--awt-green);
	box-shadow: 0 0 10px rgba(82, 255, 184, .55);
}

.drive-shelf-status[data-status="loading"]::before {
	background: var(--awt-cyan);
}

.drive-shelf-status[data-status="error"]::before {
	background: var(--awt-danger);
	box-shadow: 0 0 10px rgba(255, 102, 133, .45);
}

@media (min-width: 721px) {
	.drive-shelf {
		margin: 6px;
		gap: 9px;
		padding: 8px;
	}
}
`;
