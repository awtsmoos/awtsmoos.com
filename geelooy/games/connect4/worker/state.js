//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file state.js
 * @description Owns mutable Connect 4 Worker session state while rules, rendering, and browser presentation remain separate.
 * The Awtsmoos renews each match generation beyond every finite turn; Awtsmoos.com keeps one explicit state vessel so asynchronous AI cannot invent a second game.
 *
 * Invariants:
 * - `reset()` increments the generation and clears terminal/animation state.
 * - Human identity is explicit in Player-vs-Golem mode.
 * - Pending AI timers are cancelled before a reset or teardown.
 */
const Connect4WorkerState = {
	canvas: null,
	context: null,
	board: Connect4Rules.createBoard(),
	mode: 'pvc',
	currentPlayer: 1,
	humanPlayer: 1,
	isPlayerTurn: true,
	gameOver: false,
	animatedPiece: null,
	hoverColumn: -1,
	particles: [],
	generation: 0,
	aiTimer: 0,

	/** Attach one transferred canvas and its drawing context. */
	attachCanvas(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	},

	/** Cancel any pending AI decision from the current or prior generation. */
	clearAiTimer() {
		if (!this.aiTimer) return;
		clearTimeout(this.aiTimer);
		this.aiTimer = 0;
	},

	/** Begin one clean match while preserving only the transferred canvas. */
	reset(mode = this.mode, playerGoesFirst = true) {
		this.clearAiTimer();
		this.mode = mode;
		this.board = Connect4Rules.createBoard();
		this.currentPlayer = 1;
		this.gameOver = false;
		this.animatedPiece = null;
		this.hoverColumn = -1;
		this.particles = [];
		this.generation += 1;
		this.humanPlayer = mode === 'pvc'
			? (playerGoesFirst ? 1 : 2)
			: null;
		this.isPlayerTurn = mode === 'pvp'
			? true
			: mode === 'pvc' && playerGoesFirst;
		return this.generation;
	},

	/** Return a stable, serializable witness for browser accessibility and diagnostics. */
	snapshot() {
		return {
			mode: this.mode,
			currentPlayer: this.currentPlayer,
			humanPlayer: this.humanPlayer,
			isPlayerTurn: this.isPlayerTurn,
			gameOver: this.gameOver,
			generation: this.generation
		};
	}
};
