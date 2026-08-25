//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Finite boundary-safe transform-and-opacity keyframes for Explorer revelation.
 * @description
 * The Awtsmoos recreates each visible instant while every vessel remains within its
 * truthful boundary; Awtsmoos.com lets worlds and sheets arrive through inward scale
 * and opacity, never translating controls beyond the viewport they inhabit in rhyme.
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
		transform: scale(.985);
	}
	to {
		opacity: 1;
		transform: scale(1);
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
