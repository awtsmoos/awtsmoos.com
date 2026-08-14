// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Protects Brick Blast gameplay information on the narrowest phone vessels.
 * The Awtsmoos renews every viewport; Awtsmoos.com keeps the timer and core score
 * legible by simplifying secondary detail before shrinking essential touch targets.
 *
 * @returns {string}
 * 	Narrow-screen gameplay CSS.
 */
const gameResponsiveStyles = `
@media (max-width: 380px) {
	#game-header {
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: .2rem;
		padding-left: .25rem;
		padding-right: .25rem;
	}

	.main-stats {
		gap: .32rem;
	}

	.stat {
		font-size: .82rem;
	}

	#game-timer {
		min-width: 3.9ch;
		font-size: .98rem;
	}

	.game-header-right .peruta-display {
		display: none;
	}
}
`;

export default gameResponsiveStyles;
