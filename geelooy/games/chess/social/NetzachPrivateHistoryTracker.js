// B"H
// Boruch Hashem
// Blessed is He

import {
	HISTORY_ACTIVITY,
	HISTORY_START
} from "../online/protocol.js";

/**
 * @file Records ordinary non-watchable local chess games for verified logged-in users.
 * @description Netzach remembers the private game without opening a public watching door;
 * the Awtsmoos renews each click and result, while Awtsmoos.com binds memory to the verified account shore.
 */

/** Observes normal local/AI games and silently skips anonymous or socially managed games. */
export class NetzachPrivateHistoryTracker {
	constructor(socket, observer = window.awtsmoosChessObserver) {
		this.socket = socket;
		this.observer = observer;
		this.gamePromise = Promise.resolve("");
		this.queue = Promise.resolve();
		this.suppressNext = false;
		this.bindObserver();
	}

	/** Suppresses exactly one upcoming legacy mode selection managed by a social/online flow. */
	suppressNextMode() {
		this.suppressNext = true;
	}

	/** Binds mode, human square, AI move, and result observations once. */
	bindObserver() {
		if (!this.observer) {
			return;
		}
		this.observer.addEventListener("mode", (event) => this.startGame(event.detail.mode));
		this.observer.addEventListener("square", (event) => this.recordSquare(event.detail));
		this.observer.addEventListener("engine-move", (event) => this.recordEngineMove(event.detail));
		this.observer.addEventListener("finished", (event) => this.recordFinished(event.detail.result));
	}

	/** Starts a private history record only when the server confirms authenticated identity. */
	startGame(mode) {
		if (this.suppressNext) {
			this.suppressNext = false;
			this.gamePromise = Promise.resolve("");
			return;
		}
		const title = mode === "pva"
			? "Player vs AI"
			: mode === "ava" ? "AI vs AI" : "Local Player vs Player";
		this.gamePromise = this.socket.request(HISTORY_START, { mode, title })
			.then((response) => response.payload.authenticated ? response.payload.gameId : "")
			.catch((error) => {
				console.error("Private chess history start failed:", error);
				return "";
			});
	}

	/** Records human/local rendered clicks for Player-vs-AI and local PVP. */
	recordSquare(square) {
		const mode = this.observer?.mode;
		if (!["pva", "local-pvp"].includes(mode)) {
			return;
		}
		this.enqueue({ type: "game.click", row: square.row, column: square.column });
	}

	/** Converts engine moves into the same two-click history vocabulary used by spectators. */
	recordEngineMove(move) {
		const mode = this.observer?.mode;
		if (!["pva", "ava"].includes(mode)) {
			return;
		}
		this.enqueue({ type: "game.click", row: move.from.row, column: move.from.column });
		this.enqueue({ type: "game.click", row: move.to.row, column: move.to.column });
	}

	/** Records the existing legacy result text as the final activity. */
	recordFinished(result) {
		this.enqueue({ type: "game.finished", result });
	}

	/** Serializes private history writes while never blocking or rejecting the chess controller. */
	enqueue(activity) {
		this.queue = this.queue
			.catch(() => {})
			.then(async () => {
				const gameId = await this.gamePromise;
				if (!gameId) {
					return;
				}
				await this.socket.request(HISTORY_ACTIVITY, { gameId, activity });
			})
			.catch((error) => console.error("Private chess history activity failed:", error));
	}
}
