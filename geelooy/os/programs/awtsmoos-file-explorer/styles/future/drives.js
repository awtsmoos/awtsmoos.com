//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile-first connected-world rail with a shared global remote-health capsule.
 * @description
 * The Awtsmoos keeps distant worlds visible on the narrowest screen; Awtsmoos.com gives
 * the rail protected height, thumb-native snap motion, and a two-line status signal whose
 * color follows the same state language as each world card, so the whole horizon may rhyme.
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
	flex: 0 0 min(220px, 62vw);
	align-self: stretch;
	min-height: 92px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 5px;
	padding: 10px 12px 10px 28px;
	position: relative;
	border-radius: var(--awt-radius-lg);
	background: linear-gradient(145deg, rgba(2, 14, 27, .88), rgba(20, 55, 78, .68));
	border: 1px solid var(--awt-line);
	color: var(--awt-muted);
	scroll-snap-align: start;
}

.drive-shelf-status::before {
	content: "";
	position: absolute;
	left: 12px;
	top: 16px;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--awt-green);
	box-shadow: 0 0 10px rgba(82, 255, 184, .5);
}

.drive-shelf-status-label {
	color: var(--awt-text);
	font: 820 var(--awt-text-sm)/1.2 var(--awt-font);
}

.drive-shelf-status-detail {
	font: 600 var(--awt-text-xs)/1.35 var(--awt-font);
}

.drive-shelf-status[data-state="connecting"]::before {
	background: var(--awt-cyan);
	animation: awt-connection-pulse 1.25s ease-in-out infinite;
}

.drive-shelf-status[data-state="error"] {
	border-color: rgba(255, 102, 133, .42);
}

.drive-shelf-status[data-state="error"]::before {
	background: var(--awt-danger);
}

.drive-shelf-status[data-state="needs-credential"]::before,
.drive-shelf-status[data-state="offline"]::before {
	background: var(--awt-gold);
	box-shadow: none;
}

@media (min-width: 721px) {
	.drive-shelf {
		min-height: 112px;
		margin: 6px;
		gap: 10px;
		padding: 9px;
	}

	.drive-shelf-status {
		flex-basis: 240px;
	}
}
`;
