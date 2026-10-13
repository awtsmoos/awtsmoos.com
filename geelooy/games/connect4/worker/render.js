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

	/** Draw every board cell and accepted disc: deep-ocean lacquer + glossy discs. */
	drawBoard(state, geometry) {
		const { cellWidth, cellHeight, radius } = geometry;
		const ctx = state.context;
		const W = state.canvas.width, H = state.canvas.height;
		// B"H lacquered board: deep blue gradient with subtle wave texture.
		const bg = ctx.createLinearGradient(0, 0, 0, H);
		bg.addColorStop(0, '#1565c0');
		bg.addColorStop(0.5, '#0d47a1');
		bg.addColorStop(1, '#082c6c');
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		ctx.save();
		ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
		ctx.strokeStyle = 'rgba(255,255,255,0.045)';
		ctx.lineWidth = 1.4;
		for (let i = 0; i < 26; i += 1) {
			const wy = (i / 26) * H + Math.sin(i * 2.3) * 6;
			ctx.beginPath();
			ctx.moveTo(0, wy);
			ctx.bezierCurveTo(W * 0.3, wy + 8, W * 0.7, wy - 8, W, wy);
			ctx.stroke();
		}
		ctx.restore();
		for (let row = 0; row < Connect4Rules.rows; row += 1) {
			for (let column = 0; column < Connect4Rules.columns; column += 1) {
				const cx = column * cellWidth + cellWidth / 2;
				const cy = row * cellHeight + cellHeight / 2;
				// socket shadow
				ctx.save();
				ctx.fillStyle = 'rgba(0,0,0,0.45)';
				ctx.beginPath();
				ctx.arc(cx + 2, cy + 3, radius, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
				const piece = state.board[row][column];
				if (piece) this.drawGlossDisc(ctx, cx, cy, radius, piece);
				else {
					// empty socket: dark inset
					const sg = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.2, cx, cy, radius);
					sg.addColorStop(0, '#061a3a');
					sg.addColorStop(1, '#0a2f66');
					ctx.fillStyle = sg;
					ctx.beginPath();
					ctx.arc(cx, cy, radius, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}
	},

	/** Glossy 3D disc with specular highlight. player 1 = ruby, player 2 = gold. */
	drawGlossDisc(ctx, cx, cy, radius, player) {
		const tones = player === 1
			? { hi: '#ff8a8a', base: '#e53232', dark: '#8f1010' }
			: { hi: '#ffe9a8', base: '#f5c542', dark: '#9a6f10' };
		const g = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, radius * 0.1, cx, cy, radius);
		g.addColorStop(0, tones.hi);
		g.addColorStop(0.55, tones.base);
		g.addColorStop(1, tones.dark);
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.fill();
		// specular
		ctx.fillStyle = 'rgba(255,255,255,0.5)';
		ctx.beginPath();
		ctx.ellipse(cx - radius * 0.32, cy - radius * 0.38, radius * 0.28, radius * 0.16, -0.5, 0, Math.PI * 2);
		ctx.fill();
		// rim
		ctx.strokeStyle = 'rgba(0,0,0,0.4)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
		ctx.stroke();
	},

	/** Draw keyboard/pointer preview: arrow at top plus a ghost disc where the piece will land. */
	drawHover(state, geometry) {
		if (state.hoverColumn < 0 || state.animatedPiece || !state.isPlayerTurn || state.gameOver) return;
		const { cellWidth, cellHeight, radius } = geometry;
		const cx = state.hoverColumn * cellWidth + cellWidth / 2;
		const color = state.currentPlayer === 1 ? '255, 77, 77' : '255, 255, 77';
		// Top arrow indicator
		state.context.save();
		state.context.fillStyle = `rgba(${color},0.85)`;
		state.context.beginPath();
		state.context.moveTo(cx, 6);
		state.context.lineTo(cx - 9, 20);
		state.context.lineTo(cx + 9, 20);
		state.context.closePath();
		state.context.fill();
		state.context.restore();
		// Ghost disc at the true landing row
		const targetRow = Connect4Rules.getTargetRow(state.board, state.hoverColumn);
		if (targetRow < 0) return;
		const cy = targetRow * cellHeight + cellHeight / 2;
		const pulse = 0.35 + 0.2 * Math.sin(performance.now() / 280);
		state.context.save();
		state.context.setLineDash([7, 5]);
		state.context.lineWidth = 3;
		state.context.strokeStyle = `rgba(${color},${pulse + 0.35})`;
		state.context.beginPath();
		state.context.arc(cx, cy, radius, 0, Math.PI * 2);
		state.context.stroke();
		state.context.setLineDash([]);
		state.context.fillStyle = `rgba(${color},${pulse * 0.55})`;
		state.context.beginPath();
		state.context.arc(cx, cy, radius, 0, Math.PI * 2);
		state.context.fill();
		state.context.restore();
	},

	/** Draw the one falling disc animation without yet mutating board truth. */
	drawAnimatedPiece(state, geometry) {
		if (!state.animatedPiece) return;
		const { cellWidth, cellHeight, radius } = geometry;
		this.drawGlossDisc(
			state.context,
			state.animatedPiece.column * cellWidth + cellWidth / 2,
			state.animatedPiece.y + cellHeight / 2,
			radius,
			state.animatedPiece.player
		);
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
