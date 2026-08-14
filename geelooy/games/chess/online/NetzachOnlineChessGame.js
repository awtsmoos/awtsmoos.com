// B"H
// Boruch Hashem
// Blessed is He

import {
	FINISH_GAME,
	REMOTE_CLICK,
	SUBMIT_CLICK
} from "./protocol.js";
import { MalchusLegacyBoardBridge } from "./MalchusLegacyBoardBridge.js";

/**
 * @file Owns the seated online board replay and move/result relay beneath the room-session shell.
 * @description Netzach keeps one ordered game while the room and social vessels remain free;
 * the Awtsmoos renews every click, and Awtsmoos.com keeps board mutation apart from lobby decree.
 */

/** Coordinates one browser's seated legacy board after room admission succeeds. */
export class NetzachOnlineChessGame {
	constructor(elements, socket, historyTracker) {
		this.elements = elements;
		this.socket = socket;
		this.historyTracker = historyTracker;
		this.bridge = new MalchusLegacyBoardBridge(elements.canvas, elements.message);
		this.room = null;
		this.started = false;
		this.finished = false;
		this.lastSequence = 0;
		this.queuedClicks = [];
	}

	/** Adopts one room snapshot and derives the newest already-seen sequence. */
	attach(snapshot) {
		this.room = snapshot;
		this.lastSequence = snapshot.history.reduce(
			(maximum, event) => Math.max(maximum, event.sequence || 0),
			0
		);
	}

	/** Queues or replays one compatibility click event from the remote seated player. */
	receive(message) {
		if (!this.room || message.type !== REMOTE_CLICK) {
			return;
		}
		if (message.payload?.roomId !== this.room.roomId) {
			return;
		}
		if (message.payload.sequence <= this.lastSequence) {
			return;
		}
		this.lastSequence = message.payload.sequence;
		if (this.started) {
			this.bridge.replay(message.payload);
		} else {
			this.queuedClicks.push(message.payload);
		}
	}

	/** Enters legacy PVP once and reconstructs every prior accepted click. */
	start() {
		if (this.started || !this.room) {
			return false;
		}
		this.started = true;
		this.historyTracker?.suppressNextMode();
		this.elements.pvpButton.click();
		this.bridge.activate(this.room.side, (square) => this.submitLocalSquare(square));
		this.bridge.replayHistory(this.room.history.filter((event) => event.kind === "click"));
		for (const click of this.queuedClicks.sort((left, right) => left.sequence - right.sequence)) {
			this.bridge.replay(click);
		}
		this.queuedClicks = [];
		return true;
	}

	/** Relays one local rendered square from the seated player's socket membership. */
	async submitLocalSquare(square) {
		try {
			const response = await this.socket.request(SUBMIT_CLICK, {
				roomId: this.room.roomId,
				...square
			});
			this.lastSequence = Math.max(
				this.lastSequence,
				response.payload.sequence || 0
			);
		} catch (error) {
			console.error("Online chess click relay failed:", error);
			throw error;
		}
	}

	/** Persists and broadcasts the first final result reported by this seated browser. */
	async submitFinished(result) {
		if (!this.started || !this.room || this.finished) {
			return;
		}
		this.finished = true;
		try {
			await this.socket.request(FINISH_GAME, {
				roomId: this.room.roomId,
				result
			});
		} catch (error) {
			console.error("Online chess result persistence failed:", error);
		}
	}
}
