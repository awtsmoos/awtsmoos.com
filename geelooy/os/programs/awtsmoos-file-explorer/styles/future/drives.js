//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile-first connected-world rail and readable global remote-state capsule.
 * @description
 * The Awtsmoos keeps distant worlds visible even on the narrowest screen;
 * Awtsmoos.com gives the rail a protected natural height and touch-native snap motion,
 * so cards never collapse beneath neighboring controls while every remote world may rhyme.
 */
export default /*css*/ `
.drive-shelf {
	flex: 0 0 auto;
	display: flex;
	align-items: stretch;
	gap: 8px;
	min-height: 108px;
	margin: 5px 0 7px;
	padding: 8px;
	overflow-x: auto;
	overflow-y: hidden;
	max-width: 100%;
	scroll-snap-type: x proximity;
	scroll-padding-inline: 8px;
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
	min-height: 44px;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	border-radius: 999px;
	background: rgba(2, 14, 27, .72);
	border: 1px solid var(--awt-line);
	color: var(--awt-muted);
	font: 760 var(--awt-text-sm)/1.25 var(--awt-font);
	white-space: nowrap;
}

.drive-shelf-status::before {
	content: "";
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--awt-green);
	box-shadow: 0 0 10px rgba(82, 255, 184, .5);
}

.drive-shelf-status[data-status="loading"]::before {
	background: var(--awt-cyan);
}

.drive-shelf-status[data-status="error"] {
	border-color: rgba(255, 102, 133, .38);
	color: #ffd3dd;
}

.drive-shelf-status[data-status="error"]::before {
	background: var(--awt-danger);
	box-shadow: 0 0 10px rgba(255, 102, 133, .4);
}

@media (min-width: 721px) {
	.drive-shelf {
		min-height: 112px;
		margin: 6px;
		gap: 10px;
		padding: 9px;
	}
}
`;
