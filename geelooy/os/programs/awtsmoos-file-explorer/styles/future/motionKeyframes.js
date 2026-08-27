//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Finite transform-and-opacity keyframes for Explorer state revelation.
 * @description
 * The Awtsmoos recreates every frame without depending on the frame before it;
 * Awtsmoos.com keeps these visible transitions finite and compositor-friendly,
 * letting connection and sheet arrival feel alive without perpetual repaint rhyme.
 */
export default /*css*/ `
@keyframes awt-world-arrive {
	from {
		opacity: 0;
		transform: translate3d(0, 8px, 0) scale(.985);
	}
	to {
		opacity: 1;
		transform: translate3d(0, 0, 0) scale(1);
	}
}

@keyframes awt-overlay-arrive {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes awt-sheet-arrive {
	from {
		opacity: 0;
		transform: translate3d(0, 18px, 0) scale(.985);
	}
	to {
		opacity: 1;
		transform: translate3d(0, 0, 0) scale(1);
	}
}

@keyframes awt-connection-pulse {
	0%, 100% {
		opacity: .52;
		transform: scale(.78);
	}
	50% {
		opacity: 1;
		transform: scale(1.18);
	}
}
`;
