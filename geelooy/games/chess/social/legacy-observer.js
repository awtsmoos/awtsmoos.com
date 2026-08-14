// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Observes the legacy chess UI and engine before main.js starts, without changing either one.
 * @description The Awtsmoos renews every move while this vessel only witnesses the light;
 * Awtsmoos.com can publish a local game remotely without entering the engine's search or fight.
 */

(() => {
	const BOARD_PADDING = 20;
	const ENGINE_NAME = "awtsmoos_chess_engine.js";

	/** Emits normalized legacy chess observations for optional broadcasters. */
	class ChochmahLegacyChessObserver extends EventTarget {
		constructor() {
			super();
			this.mode = "";
			this.finishedText = "";
			this.installWorkerWitness();
			this.installDomWitness();
		}

		/** Wraps Worker construction only to observe engine best-move messages. */
		installWorkerWitness() {
			const NativeWorker = window.Worker;
			const observer = this;
			window.Worker = class AwtsmoosObservedWorker extends NativeWorker {
				constructor(url, options) {
					super(url, options);
					if (String(url).includes(ENGINE_NAME)) {
						this.addEventListener("message", (event) => observer.observeEngineMessage(event.data));
					}
				}
			};
		}

		/** Binds menu mode selection, rendered square releases, and game-over observation. */
		installDomWitness() {
			const bind = () => {
				this.bindMode("playVsAiButton", "pva");
				this.bindMode("playVsPlayerButton", "local-pvp");
				this.bindMode("aiVsAiButton", "ava");
				this.bindBoard(document.getElementById("chessCanvas"));
				this.bindGameOver(document.getElementById("gameOverOverlay"));
			};
			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", bind, { once: true });
			} else {
				bind();
			}
		}

		/** Records the legacy mode chosen by the local host. */
		bindMode(id, mode) {
			document.getElementById(id)?.addEventListener("click", () => {
				this.mode = mode;
				this.finishedText = "";
				this.emit("mode", { mode });
			});
		}

		/** Observes rendered board releases after the legacy controller receives them. */
		bindBoard(canvas) {
			if (!canvas) return;
			canvas.addEventListener("mouseup", (event) => {
				const square = this.squareFromEvent(canvas, event);
				if (square) this.emit("square", square);
			});
		}

		/** Converts browser coordinates into intrinsic row/column indices. */
		squareFromEvent(canvas, event) {
			const corrected = event.awtsmoosLegacySquare;
			if (corrected) return corrected;
			const rect = canvas.getBoundingClientRect();
			const boardSize = canvas.width - BOARD_PADDING * 2;
			const x = (event.clientX - rect.left) * canvas.width / rect.width - BOARD_PADDING;
			const y = (event.clientY - rect.top) * canvas.height / rect.height - BOARD_PADDING;
			const column = Math.floor(x / (boardSize / 8));
			const row = Math.floor(y / (boardSize / 8));
			return row >= 0 && row < 8 && column >= 0 && column < 8 ? { row, column } : null;
		}

		/** Converts AI best moves into the same pair of observable rendered clicks. */
		observeEngineMessage(message) {
			const move = message?.bestMove;
			if (!move?.from || !move?.to || !["pva", "ava"].includes(this.mode)) return;
			this.emit("engine-move", {
				from: { row: move.from[0], column: move.from[1] },
				to: { row: move.to[0], column: move.to[1] }
			});
		}

		/** Watches the existing game-over overlay and emits each distinct result once. */
		bindGameOver(overlay) {
			if (!overlay) return;
			new MutationObserver(() => {
				if (overlay.classList.contains("hidden")) return;
				const text = document.getElementById("gameOverText")?.textContent?.trim() || "";
				if (!text || text === this.finishedText) return;
				this.finishedText = text;
				this.emit("finished", { result: text });
			}).observe(overlay, { attributes: true, childList: true, subtree: true, characterData: true });
		}

		/** Dispatches one detached CustomEvent for optional network publishers. */
		emit(type, detail) {
			this.dispatchEvent(new CustomEvent(type, { detail }));
		}
	}

	window.awtsmoosChessObserver = new ChochmahLegacyChessObserver();
})();
