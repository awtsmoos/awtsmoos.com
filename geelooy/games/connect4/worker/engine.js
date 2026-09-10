//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file engine.js
 * @description Owns authoritative Connect 4 move acceptance, turn transitions, AI scheduling, and terminal result publication inside the Worker.
 * The Awtsmoos renews every finite contest beyond request order; Awtsmoos.com lets accessibility and Party consume accepted engine truth rather than optimistic button intent.
 *
 * Invariants:
 * - Board mutation occurs only after a falling disc reaches its target row.
 * - One terminal result is emitted per state generation.
 * - Player-vs-Golem human identity remains stable for the entire match.
 */
const Connect4Engine = {
	/** Initialize transferred rendering state and one fresh match. */
	init(data) {
		Connect4WorkerState.attachCanvas(data.canvas);
		this.resize(data);
		this.reset(data.gameMode, data.playerGoesFirst);
		Connect4Loop.start();
	},

	/** Resize intrinsic Worker canvas dimensions. */
	resize(data) {
		if (!Connect4WorkerState.canvas) return;
		Connect4WorkerState.canvas.width = Math.max(1, Number(data.width) || 1);
		Connect4WorkerState.canvas.height = Math.max(1, Number(data.height) || 1);
	},

	/** Begin a fresh generation and schedule an opening AI turn when required. */
	reset(mode = Connect4WorkerState.mode, playerGoesFirst = true) {
		Connect4WorkerState.reset(mode, playerGoesFirst);
		this.emitState('ready');
		this.scheduleAi(20);
	},

	/** Schedule AI only when the current mode and turn require it. */
	scheduleAi(delay = 500) {
		const state = Connect4WorkerState;
		const aiNeeded = state.mode === 'cvc'
			|| (state.mode === 'pvc' && !state.isPlayerTurn);
		if (!aiNeeded || state.gameOver || state.animatedPiece) return;
		state.clearAiTimer();
		const generation = state.generation;
		state.aiTimer = setTimeout(() => {
			state.aiTimer = 0;
			if (generation !== state.generation) return;
			this.aiMove();
		}, delay);
	},

	/** Ask the existing deterministic AI helper for one legal column. */
	aiMove() {
		const state = Connect4WorkerState;
		if (state.gameOver || state.animatedPiece) return;
		state.isPlayerTurn = false;
		const column = getGolemMove(state.board, state.currentPlayer);
		if (column >= 0) this.dropPiece(column);
	},

	/** Start one accepted falling-disc animation when the column is legal. */
	dropPiece(column) {
		const state = Connect4WorkerState;
		if (state.gameOver || state.animatedPiece) return false;
		const targetRow = Connect4Rules.getTargetRow(state.board, column);
		if (targetRow < 0) return false;
		const cellHeight = state.canvas.height / Connect4Rules.rows;
		state.animatedPiece = {
			column,
			player: state.currentPlayer,
			targetRow,
			y: -cellHeight,
			speed: 0
		};
		this.emitState('move-started', { column });
		return true;
	},

	/** Advance the falling disc and decorative particles by one animation frame. */
	update() {
		const state = Connect4WorkerState;
		if (state.animatedPiece) {
			state.animatedPiece.speed += 1.45;
			state.animatedPiece.y += state.animatedPiece.speed;
			const cellHeight = state.canvas.height / Connect4Rules.rows;
			const targetY = state.animatedPiece.targetRow * cellHeight;
			if (state.animatedPiece.y >= targetY) {
				state.animatedPiece.y = targetY;
				Connect4Turn.acceptAnimatedPiece(state);
			}
		}
		Connect4Effects.update(state);
	},

	/** Publish a serializable authoritative state witness to the browser. */
	emitState(reason, extra = {}) {
		postMessage({
			type: 'state',
			reason,
			...Connect4WorkerState.snapshot(),
			...extra
		});
	}
};
