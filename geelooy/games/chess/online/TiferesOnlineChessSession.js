// B"H
// Boruch Hashem
// Blessed is He

import {
	CREATE_ROOM,
	JOIN_ROOM,
	ROOM_READY,
	createInviteUrl,
	createPlayerStorageKey
} from "./protocol.js";
import { KeterOnlineChessView } from "./KeterOnlineChessView.js";
import { NetzachOnlineChessGame } from "./NetzachOnlineChessGame.js";

/**
 * @file Owns online-room admission and lobby presentation above the seated game controller.
 * @description Tiferes receives room identity while Netzach carries the moves below in light;
 * the Awtsmoos renews one online match, and Awtsmoos.com keeps lobby, social, and board boundaries right.
 */

/** Coordinates online-PVP create/join flow while delegating board mutation to NetzachOnlineChessGame. */
export class TiferesOnlineChessSession {
	constructor(elements, socket, socialPanel, historyTracker) {
		this.elements = elements;
		this.socket = socket;
		this.socialPanel = socialPanel;
		this.view = new KeterOnlineChessView(elements);
		this.game = new NetzachOnlineChessGame(elements, socket, historyTracker);
		this.room = null;
		this.bindEvents();
	}

	/** Binds ready/click room events, connection loss, and the existing final-result observation. */
	bindEvents() {
		this.socket.addEventListener("application-event", (event) => {
			const message = event.detail;
			if (!this.room || message.payload?.roomId !== this.room.roomId) {
				return;
			}
			if (message.type === ROOM_READY) {
				this.startGame();
				return;
			}
			this.game.receive(message);
		});
		this.socket.addEventListener("connection-closed", () => {
			this.view.showConnectionLoss();
		});
		window.awtsmoosChessObserver?.addEventListener("finished", (event) => {
			this.game.submitFinished(event.detail.result);
		});
	}

	/** Creates one online-PVP room and reveals both player and spectator social surfaces. */
	async create(options = {}) {
		this.view.showLobby("Creating your online chess room…");
		const response = await this.socket.request(CREATE_ROOM, {
			mode: "online-pvp",
			visibility: options.visibility || "unlisted",
			title: options.title || "Online chess",
			displayName: options.displayName || ""
		});
		this.adoptSnapshot(response.payload);
		this.view.showInvite(
			createInviteUrl(this.room.roomId),
			"Share this player link. The game begins when your opponent opens it."
		);
	}

	/** Joins or reconnects to one player invitation using only the private locally stored seat token. */
	async join(roomId, displayName = "") {
		this.view.showLobby("Joining the online chess room…");
		const playerToken = localStorage.getItem(createPlayerStorageKey(roomId)) || "";
		const response = await this.socket.request(JOIN_ROOM, {
			roomId,
			playerToken,
			displayName
		});
		this.adoptSnapshot(response.payload);
		this.view.showInvite(
			createInviteUrl(this.room.roomId),
			this.room.ready ? "Opponent found. Starting game…" : "Waiting for the other player…"
		);
		if (this.room.ready) {
			this.startGame();
		}
	}

	/** Adopts one safe room snapshot and stores its reconnect capability only on this browser. */
	adoptSnapshot(snapshot) {
		this.room = snapshot;
		if (snapshot.playerToken) {
			localStorage.setItem(
				createPlayerStorageKey(snapshot.roomId),
				snapshot.playerToken
			);
		}
		this.game.attach(snapshot);
		this.socialPanel.attach(snapshot);
	}

	/** Starts the seated legacy board exactly once after the room becomes ready. */
	startGame() {
		if (this.game.start()) {
			this.view.showGame(this.room.side);
		}
	}
}
