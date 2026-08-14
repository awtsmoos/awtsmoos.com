// B"H
// Boruch Hashem
// Blessed is He

import {
	CREATE_ROOM,
	PUBLISH_EVENT
} from "../online/protocol.js";

/**
 * @file Publishes optional local, Player-vs-AI, and AI-vs-AI games for remote spectators.
 * @description Chesed opens a window onto the proven local board without entering its engine or law;
 * the Awtsmoos renews every observed move, while Awtsmoos.com lets distant viewers see what the host saw.
 */

const MODE_BUTTONS = Object.freeze({
	pva: "playVsAiButton",
	"local-pvp": "playVsPlayerButton",
	ava: "aiVsAiButton"
});

/** Owns one opt-in broadcast room and an ordered non-blocking publication queue. */
export class ChesedChessWatchPublisher {
	constructor(socket, socialPanel, historyTracker, observer = window.awtsmoosChessObserver) {
		this.socket = socket;
		this.socialPanel = socialPanel;
		this.historyTracker = historyTracker;
		this.observer = observer;
		this.snapshot = null;
		this.mode = "";
		this.queue = Promise.resolve();
		this.bound = false;
	}

	/** Creates a room, attaches social features, then starts the untouched legacy mode. */
	async create(options) {
		const response = await this.socket.request(CREATE_ROOM, {
			mode: options.mode,
			visibility: options.visibility,
			title: options.title,
			displayName: options.displayName
		});
		this.snapshot = response.payload;
		this.mode = options.mode;
		this.bindObserver();
		this.socialPanel.attach(this.snapshot);
		this.historyTracker?.suppressNextMode();
		this.startLegacyMode(options.mode);
		return this.snapshot;
	}

	/** Binds observation once; inactive publisher state ignores unrelated normal games. */
	bindObserver() {
		if (this.bound || !this.observer) {
			return;
		}
		this.bound = true;
		this.observer.addEventListener("square", (event) => this.observeSquare(event.detail));
		this.observer.addEventListener("engine-move", (event) => this.observeEngineMove(event.detail));
		this.observer.addEventListener("finished", (event) => {
			this.publish({ kind: "finished", ...event.detail });
		});
	}

	/** Publishes human/local clicks only for the current watchable mode. */
	observeSquare(square) {
		if (!this.snapshot || !["pva", "local-pvp"].includes(this.mode)) {
			return;
		}
		this.publish({ kind: "click", row: square.row, column: square.column });
	}

	/** Converts an AI move into two rendered clicks for deterministic spectator replay. */
	observeEngineMove(move) {
		if (!this.snapshot || !["pva", "ava"].includes(this.mode)) {
			return;
		}
		this.publish({ kind: "click", row: move.from.row, column: move.from.column });
		this.publish({ kind: "click", row: move.to.row, column: move.to.column });
	}

	/** Appends publication to a promise chain so networking never blocks legacy chess. */
	publish(event) {
		if (!this.snapshot) {
			return;
		}
		this.queue = this.queue
			.catch(() => {})
			.then(() => this.socket.request(PUBLISH_EVENT, {
				roomId: this.snapshot.roomId,
				event
			}))
			.catch((error) => {
				console.error("Chess watch publication failed:", error);
				this.socialPanel.view.setStatus(
					"Watching stream interrupted; the local chess game is still running."
				);
			});
	}

	/** Invokes the exact legacy menu button a normal local user would click. */
	startLegacyMode(mode) {
		const button = document.getElementById(MODE_BUTTONS[mode]);
		if (!button) {
			throw new Error(`Chess mode button is unavailable: ${mode}`);
		}
		button.click();
	}
}
