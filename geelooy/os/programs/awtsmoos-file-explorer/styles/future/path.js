//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Calm touch-sized path controls for the futuristic Awtsmoos Explorer.
 * @description
 * The Awtsmoos lets each path segment become a stepping stone across local and
 * distant worlds. Awtsmoos.com keeps the stones broad enough for a thumb, compact
 * enough for a desktop, and visually quiet so navigation remains the central rhyme.
 */
export default /*css*/ `
.path-bar-container {
	min-height: var(--awt-touch);
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 0;
	padding: 6px;
	overflow-x: auto;
	scrollbar-width: none;
	overscroll-behavior-inline: contain;
}

.path-bar-container::-webkit-scrollbar {
	display: none;
}

.path-segment {
	flex: 0 0 auto;
	min-height: 38px;
	display: inline-flex;
	align-items: center;
	padding: 7px 10px;
	border: 1px solid transparent;
	border-radius: 999px;
	background: rgba(255, 255, 255, .06);
	color: var(--awt-text);
	font: 720 11px var(--awt-font);
	white-space: nowrap;
}

.path-segment:active {
	transform: scale(.97);
	border-color: var(--awt-line2);
}

.path-separator {
	flex: 0 0 auto;
	color: var(--awt-cyan);
	font-weight: 900;
}

@media (hover: hover) and (pointer: fine) {
	.path-segment:hover {
		background: rgba(92, 246, 255, .12);
		border-color: rgba(92, 246, 255, .24);
	}
}

@media (min-width: 721px) {
	.path-bar-container {
		min-height: 42px;
	}

	.path-segment {
		min-height: 32px;
		border-radius: var(--awt-radius-sm);
	}
}
`;
