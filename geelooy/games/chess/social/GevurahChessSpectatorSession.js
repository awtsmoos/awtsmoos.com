// B"H
// Boruch Hashem
// Blessed is He

import {
	GAME_EVENT,
	WATCH_ROOM
} from "../online/protocol.js";
import {
	MalchusLegacyBoardBridge
} from "../online/MalchusLegacyBoardBridge.js";

/**
 * @file Reconstructs a remote game through the proven local board while keeping input read-only.
 * @description Gevurah receives the game but refuses the spectator's hand from entering the fight;
 * the Awtsmoos renews every observed square, while Awtsmoos.com lets distance become sight.
 */

/** Owns one read-only spectator role and deterministic legacy-board replay. */
export class GevurahChessSpectatorSession {
	constructor(options) {
		this.socket = options.socket;
		this.socialPanel = options.socialPanel;
		this.historyTracker = options.historyTracker;
		this.canvas = options.canvas;
		this.message = options.message;
		this.pvpButton = options.pvpButton;
		this.bridge = new MalchusLegacyBoardBridge(this.canvas, this.message);
		this.snapshot = null;
		this.lastSequence = 0;
		this.socket.addEventListener("application-event", (event) => {
			this.receiveEvent(event.detail);
		});
	}

	/** Joins as spectator, starts a locked legacy board, and reconstructs existing history. */
	async watch(roomId, displayName = "") {
		const response = await this.socket.request(WATCH_ROOM, {
			roomId,
			displayName
		});
		this.snapshot = response.payload;
		this.lastSequence = this.snapshot.history.reduce(
			(maximum, event) => Math.max(maximum, event.sequence || 0),
			0
		);
		this.historyTracker?.suppressNextMode();
		this.pvpButton.click();
		this.bridge.activate("spectator", null);
		this.replayHistory(this.snapshot.history);
		this.socialPanel.attach(this.snapshot);
		this.socialPanel.view.setStatus(`Watching ${this.snapshot.title || "live chess"}.`);
		return this.snapshot;
	}

	/** Applies only ordered same-room game events and ignores social traffic. */
	receiveEvent(message) {
		if (!this.snapshot || message.type !== GAME_EVENT) {
			return;
		}
		if (message.payload?.roomId !== this.snapshot.roomId) {
			return;
		}
		const event = message.payload.event;
		if (!event || event.sequence <= this.lastSequence) {
			return;
		}
		this.lastSequence = event.sequence;
		this.replayEvent(event);
	}

	/** Replays a reconnect snapshot quickly and in server sequence order. */
	replayHistory(history) {
		const ordered = [...history].sort((left, right) => left.sequence - right.sequence);
		for (const event of ordered) {
			this.replayEvent(event);
		}
	}

	/** Translates observable game events into the untouched legacy board presentation. */
	replayEvent(event) {
		if (event.kind === "click") {
			this.bridge.replay({ row: event.row, column: event.column });
			return;
		}
		if (event.kind === "finished") {
			this.socialPanel.view.setStatus(event.result || "Game finished.");
		}
	}
}
