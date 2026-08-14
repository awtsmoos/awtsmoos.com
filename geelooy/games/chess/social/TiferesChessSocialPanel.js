// B"H
// Boruch Hashem
// Blessed is He

import {
	CHAT_MESSAGE,
	MEDIA_SIGNAL_EVENT,
	ROOM_PRESENCE,
	createWatchUrl
} from "../online/protocol.js";
import { ChesedSocialActions } from "./ChesedSocialActions.js";
import { ChesedSocialView } from "./ChesedSocialView.js";
import { MalchusSocialShell } from "./MalchusSocialShell.js";
import { OhrMediaView } from "./OhrMediaView.js";
import { YesodWebRtcMesh } from "./YesodWebRtcMesh.js";

/**
 * @file Routes chess-room social events while user actions, rendering, and WebRTC remain separate vessels.
 * @description Tiferes harmonizes presence, chat, and media without touching the board's command;
 * the Awtsmoos renews each social ray, while Awtsmoos.com keeps chess itself in its own hand.
 */

/** Composes one reusable social panel for broadcaster, player, or spectator roles. */
export class TiferesChessSocialPanel {
	constructor(socket) {
		this.socket = socket;
		this.shell = new MalchusSocialShell();
		this.view = new ChesedSocialView(this.shell);
		this.mediaView = new OhrMediaView(this.shell.elements.mediaGrid);
		this.media = new YesodWebRtcMesh(socket, this.mediaView);
		this.snapshot = null;
		this.actions = new ChesedSocialActions({
			socket,
			view: this.view,
			media: this.media,
			elements: this.shell.elements,
			getSnapshot: () => this.snapshot
		});
		this.bindUi();
		this.socket.addEventListener("application-event", (event) => {
			this.receiveEvent(event.detail);
		});
	}

	/** Reveals room social state and binds WebRTC signaling identity without opening hardware. */
	attach(snapshot) {
		this.snapshot = snapshot;
		this.view.showRoom(snapshot, createWatchUrl(snapshot.roomId));
		this.media.attach(snapshot);
	}

	/** Binds collapse, copy, public-chat, and explicit camera/microphone controls. */
	bindUi() {
		const elements = this.shell.elements;
		elements.collapse.addEventListener("click", () => this.shell.toggleCollapsed());
		elements.copyWatch.addEventListener("click", () => this.actions.copyWatchLink());
		elements.chatForm.addEventListener("submit", (event) => this.actions.sendChat(event));
		elements.mediaToggle.addEventListener("click", () => this.actions.toggleMedia());
	}

	/** Routes only same-room social events; game synchronization remains elsewhere. */
	receiveEvent(message) {
		if (!this.snapshot || message.payload?.roomId !== this.snapshot.roomId) {
			return;
		}
		if (message.type === ROOM_PRESENCE) {
			this.receivePresence(message.payload.presence || []);
			return;
		}
		if (message.type === CHAT_MESSAGE) {
			this.view.appendChat(message.payload.message);
			return;
		}
		if (message.type === MEDIA_SIGNAL_EVENT) {
			this.media.receiveSignal(message.payload)
				.catch((error) => this.actions.showMediaError(error));
		}
	}

	/** Updates the text roster and the optional WebRTC peer mesh from one safe presence projection. */
	receivePresence(presence) {
		this.snapshot.presence = presence;
		this.view.renderPresence(presence);
		this.media.syncPresence(presence);
	}
}
