//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file render.js
 * @description Draws Connect 4 board, hover preview, falling disc, particles, and terminal veil without owning rules or clickable result controls.
 * The Awtsmoos renews every visible disc beyond finite pixels; Awtsmoos.com keeps semantic result actions in DOM while this Worker draws only the board.
 *
 * Invariants:
 * - Rendering never mutates board or turn authority.
 * - Canvas result text mirrors terminal truth but never owns rematch/menu hit targets.
 * - Geometry derives exclusively from the current transferred canvas dimensions.
 */
const Connect4Render = {
	/** Draw one complete frame from current Worker state. */
	draw(state) {
		if (!state.context || !state.canvas) return;
		const geometry = this.geometry(state.canvas);
		state.context.clearRect(0, 0, state.canvas.width, state.canvas.height);
		this.drawBoard(state, geometry);
		this.drawHover(state, geometry);
		this.drawAnimatedPiece(state, geometry);
		for (const particle of state.particles) particle.draw(state.context);
		if (state.gameOver) this.drawTerminalVeil(state);
	},

	/** Return reusable cell geometry for one frame. */
	geometry(canvas) {
		const cellWidth = canvas.width / Connect4Rules.columns;
		const cellHeight = canvas.height / Connect4Rules.rows;
		return {
			cellWidth,
			cellHeight,
			radius: Math.min(cellWidth, cellHeight) / 2.7
		};
	},

	/** Draw every board cell and accepted disc. */
	drawBoard(state, geometry) {
		const { cellWidth, cellHeight, radius } = geometry;
		for (let row = 0; row < Connect4Rules.rows; row += 1) {
			for (let column = 0; column < Connect4Rules.columns; column += 1) {
				state.context.fillStyle = '#0d47a1';
				state.context.fillRect(
					column * cellWidth,
					row * cellHeight,
					cellWidth,
					cellHeight
				);
				state.context.beginPath();
				state.context.arc(
					column * cellWidth + cellWidth / 2,
					row * cellHeight + cellHeight / 2,
					radius,
					0,
					Math.PI * 2
				);
				state.context.fillStyle = this.discColor(state.board[row][column]);
				state.context.fill();
			}
		}
	},

	/** Draw keyboard/pointer preview for the currently legal human column. */
	drawHover(state, geometry) {
		if (state.hoverColumn < 0 || state.animatedPiece || !state.isPlayerTurn || state.gameOver) return;
		const { cellWidth, cellHeight, radius } = geometry;
		state.context.beginPath();
		state.context.arc(
			state.hoverColumn * cellWidth + cellWidth / 2,
			cellHeight / 2,
			radius,
			0,
			Math.PI * 2
		);
		state.context.fillStyle = state.currentPlayer === 1
			? 'rgba(255, 77, 77, 0.5)'
			: 'rgba(255, 255, 77, 0.5)';
		state.context.fill();
	},

	/** Draw the one falling disc animation without yet mutating board truth. */
	drawAnimatedPiece(state, geometry) {
		if (!state.animatedPiece) return;
		const { cellWidth, cellHeight, radius } = geometry;
		state.context.beginPath();
		state.context.arc(
			state.animatedPiece.column * cellWidth + cellWidth / 2,
			state.animatedPiece.y + cellHeight / 2,
			radius,
			0,
			Math.PI * 2
		);
		state.context.fillStyle = this.discColor(state.animatedPiece.player);
		state.context.fill();
	},

	/** Draw a noninteractive terminal veil; semantic result actions live in DOM. */
	drawTerminalVeil(state) {
		state.context.fillStyle = 'rgba(0, 0, 0, 0.58)';
		state.context.fillRect(0, 0, state.canvas.width, state.canvas.height);
	},

	/** Map one board value to its visual disc color. */
	discColor(value) {
		if (value === 1) return '#ff4d4d';
		if (value === 2) return '#ffff4d';
		return '#1a1a1a';
	}
};
