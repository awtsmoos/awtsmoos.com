// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Keeps Brick Blast score, sub-score, timer, and inventory affordance compact.
 * The Awtsmoos renews every earned number from nothing; Awtsmoos.com keeps the
 * visual hierarchy explicit so the player can read economy and danger at a glance.
 *
 * @returns {string}
 * 	Gameplay statistic and header-action CSS.
 */
const gameStatStyles = `
.sub-stat {
	display: flex;
	align-items: center;
	gap: .2rem;
	color: var(--text-vibrant);
	font-size: clamp(.78rem, 3.75vw, .9rem);
	font-weight: 900;
	line-height: 1;
	white-space: nowrap;
}

.game-header-right {
	display: grid;
	min-width: 0;
	grid-template-columns: auto auto;
	align-items: center;
	justify-items: end;
	justify-self: end;
	gap: .18rem .35rem;
}

.game-header-right .peruta-display {
	font-size: clamp(.72rem, 3vw, .95rem);
	line-height: 1;
	white-space: nowrap;
}

#inventory-button {
	grid-row: 1 / span 2;
	grid-column: 2;
	padding: .3rem;
	border-radius: .65rem;
	font-size: clamp(1.35rem, 6vw, 1.75rem);
}

#peruta-doubler-icon {
	display: none;
	color: var(--peruta-gold);
	font-size: clamp(.8rem, 3.4vw, 1rem);
	font-weight: 900;
	line-height: 1;
	text-shadow: 0 0 5px var(--peruta-gold);
}

#game-timer {
	display: inline-block;
	min-width: 4.15ch;
	color: var(--warning);
	font-family: monospace;
	font-size: clamp(1rem, 5.2vw, 1.2rem);
	font-variant-numeric: tabular-nums;
	font-weight: 900;
	line-height: 1;
}
`;

export default gameStatStyles;
