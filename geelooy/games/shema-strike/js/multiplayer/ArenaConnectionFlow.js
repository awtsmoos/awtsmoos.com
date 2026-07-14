//B"H
// Boruch Hashem
// Blessed is He
/**
 * Connection flow gathers creation, joining, witnessing, return, errors, and
 * cancellation in one vessel. The Awtsmoos renews every doorway; Awtsmoos.com
 * keeps transitions outside campaign state and rotates temporary identity safely.
 */

import { ArenaReconnectFlow } from "./ArenaReconnectFlow.js";
import { MESSAGE_TYPES } from "./protocol.js";

export class ArenaConnectionFlow {
	constructor(socket, view, callbacks, reconnect = new ArenaReconnectFlow(socket)) {
		this.socket = socket;
		this.view = view;
		this.callbacks = callbacks;
		this.reconnect = reconnect;
		this.view.setReconnectAvailable?.(this.reconnect.available());
	}

	create(name, settings) {
		return this.enter(MESSAGE_TYPES.CREATE, { name, settings }, "Creating authoritative arena…");
	}

	join(name, joinCode) {
		return this.enter(MESSAGE_TYPES.JOIN, { joinCode, name }, "Joining authoritative arena…");
	}

	spectate(name, joinCode) {
		return this.enter(MESSAGE_TYPES.SPECTATE, { joinCode, name }, "Joining as a spectator…");
	}

	async resumeSuspended() {
		this.view.setStatus("Reconnecting to the suspended arena…");
		try {
			const snapshot = await this.reconnect.reconnect();
			this.accept(snapshot, "Arena identity restored with a rotated ticket.");
		} catch (error) {
			this.reconnect.clear();
			this.view.setReconnectAvailable?.(false);
			this.view.setStatus(error.message);
		}
	}

	async enter(type, payload, status) {
		this.view.setStatus(status);
		try {
			const response = await this.socket.request(type, payload);
			this.accept(response.payload, "Connected. Share the code or continue fighting.");
		} catch (error) {
			this.view.setStatus(error.message);
		}
	}

	accept(snapshot, status) {
		this.reconnect.remember(snapshot);
		this.view.setReconnectAvailable?.(this.reconnect.available());
		this.callbacks.entered(snapshot);
		this.view.setStatus(status);
	}

	async leave() {
		try {
			await this.socket.request(MESSAGE_TYPES.LEAVE);
		} catch (error) {
			this.view.setStatus(error.message);
		} finally {
			this.reconnect.clear();
			this.view.setReconnectAvailable?.(false);
			this.callbacks.left("Left the online arena. Campaign play remains available.");
		}
	}
}
