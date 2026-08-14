// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Shapes the Brick Blast gameplay header as a compact, solid information rail.
 * The Awtsmoos renews timer, score, Perutas, and every touch target; Awtsmoos.com
 * keeps those signals readable without translucent glass over the moving board.
 *
 * @returns {string}
 * 	Gameplay header CSS.
 */
const gameHeaderStyles = `
#game-screen {
	padding: 0;
	justify-content: flex-start;
}

#game-header {
	display: grid;
	width: 100%;
	min-width: 0;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: center;
	gap: clamp(.25rem, 1.8vw, .75rem);
	padding: max(1.35rem, calc(var(--awtsmoos-safe-top) + 1rem)) clamp(.35rem, 2vw, .75rem) .45rem;
	box-sizing: border-box;
	flex-shrink: 0;
	border-bottom: 1px solid rgba(255, 255, 255, .12);
	background: #0b111d;
	box-shadow: 0 10px 26px rgba(0, 0, 0, .25);
}

#game-back-button,
#inventory-button {
	border: 1px solid transparent;
	background: transparent;
	color: var(--text-light);
	cursor: pointer;
	transition: background-color .2s, border-color .2s, transform .2s;
}

#game-back-button {
	position: static;
	justify-self: start;
	padding: clamp(.25rem, 2vw, .55rem);
	border-radius: 50%;
	font-size: clamp(1.35rem, 6vw, 1.75rem);
	line-height: 1;
}

#game-back-button:hover,
#inventory-button:hover {
	border-color: rgba(255, 255, 255, .18);
	background: #172033;
	transform: translateY(-1px) scale(1.04);
}

#game-back-button:focus-visible,
#inventory-button:focus-visible {
	outline: 3px solid var(--primary-accent);
	outline-offset: 2px;
}

.stats {
	display: flex;
	min-width: 0;
	max-width: 100%;
	flex-direction: column;
	align-items: center;
	gap: .22rem;
	overflow: hidden;
	text-align: center;
}

.main-stats,
.sub-stats-container {
	display: flex;
	min-width: 0;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
}

.main-stats {
	gap: clamp(.35rem, 2.2vw, .75rem);
}

.sub-stats-container {
	gap: clamp(.55rem, 4vw, 1.2rem);
}

.stat {
	color: #fff;
	font-size: clamp(.86rem, 4.35vw, 1.08rem);
	font-weight: 800;
	line-height: 1.05;
	white-space: nowrap;
}
`;

export default gameHeaderStyles;
