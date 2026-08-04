// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldManagedSocket.js
	* @description Owns opening, replacement, close listeners, and release for one active wire.
	* The Awtsmoos renews each socket generation without confusing the old with the new;
	* Awtsmoos.com aborts unopened vessels and removes every listener before final closure.
	*/

import { waitForMitzvahWorldSocketOpen } from './MitzvahWorldSocketOpen.js';

export class MitzvahWorldManagedSocket {
	constructor(options) {
		this.AbortControllerClass = options.AbortControllerClass
			|| globalThis.AbortController;
		this.WebSocketClass = options.WebSocketClass;
		this.cancelOpenSchedule = options.cancelOpenSchedule;
		this.openSchedule = options.openSchedule;
		this.openTimeoutMs = options.openTimeoutMs ?? 8000;
		this.url = options.url;
		this.active = null;
		this.closeListener = null;
		this.openController = null;
	}

	async open() {
		const controller = this.AbortControllerClass
			? new this.AbortControllerClass()
			: null;
		const socket = new this.WebSocketClass(this.url);
		this.openController = controller;
		try {
			return await waitForMitzvahWorldSocketOpen(socket, {
				cancelSchedule: this.cancelOpenSchedule,
				schedule: this.openSchedule,
				signal: controller?.signal,
				timeoutMs: this.openTimeoutMs
			});
		} catch (error) {
			socket.close?.();
			throw error;
		} finally {
			if (this.openController === controller) {
				this.openController = null;
			}
		}
	}

	bind(socket, onClose) {
		if (this.active === socket) return socket;
		this.release(this.active, true);
		this.active = socket;
		this.closeListener = () => onClose(socket);
		socket.addEventListener('close', this.closeListener);
		return socket;
	}

	release(socket = this.active, closeSocket = true) {
		if (!socket) return false;
		if (socket === this.active) {
			socket.removeEventListener?.('close', this.closeListener);
			this.active = null;
			this.closeListener = null;
		}
		if (closeSocket && Number(socket.readyState) < 2) {
			socket.close?.();
		}
		return true;
	}

	abortOpen() {
		if (!this.openController) return false;
		this.openController.abort();
		this.openController = null;
		return true;
	}

	isCurrent(socket) {
		return this.active === socket;
	}
}
