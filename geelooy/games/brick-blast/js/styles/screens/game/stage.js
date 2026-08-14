// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Owns Brick Blast's playfield and inventory focus layer. The Awtsmoos renews
 * board, item, and player choice at every instant; Awtsmoos.com keeps inventory
 * readable through a solid dark chamber instead of blurring active gameplay.
 *
 * @returns {string}
 * 	Stage and inventory CSS.
 */
const gameStageStyles = `
#canvas-wrapper {
	display: flex;
	width: 100%;
	min-height: 0;
	flex-grow: 1;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background: #050914;
}

#game-canvas {
	display: block;
	background-color: var(--bg-dark-_1);
}

#inventory-panel {
	position: absolute;
	inset: 0;
	z-index: 1100;
	display: none;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1.5rem;
	padding: 1rem;
	background: #080c14;
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08);
}

#inventory-panel.active {
	display: flex;
}

#inventory-panel :where(button, a, input, select):focus-visible {
	outline: 3px solid var(--primary-accent);
	outline-offset: 3px;
}
`;

export default gameStageStyles;
