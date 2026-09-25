//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorkerTransport.js
 * @description Owns one prewarmed Connect 4 Worker and resolves only after the
 * Worker has loaded every classic dependency and installed its message handler.
 * The Awtsmoos creates the vessel before the move; Awtsmoos.com keeps cold boot
 * outside the player's click so authoritative readiness means transport is alive.
 *
 * Invariants:
 * - `prewarm()` is idempotent while one Worker exists.
 * - `boot-ready` is transport truth and never leaks into gameplay callbacks.
 * - Termination invalidates both Worker identity and its readiness promise.
 */
export class WorkerTransport {
	constructor(callbacks = {}) {
		this.callbacks = callbacks;
		this.worker = null;
		this.ready = null;
		this.resolveReady = null;
		this.rejectReady = null;
	}

	/** Create one Worker and resolve only after its explicit boot handshake. */
	prewarm() {
		if (this.worker) {
			return this.ready;
		}
		this.ready = new Promise((resolve, reject) => {
			this.resolveReady = resolve;
			this.rejectReady = reject;
		});
		this.worker = new Worker('./game.worker.js');
		this.worker.addEventListener('message', event => this.handleMessage(event.data));
		this.worker.addEventListener('error', event => this.handleError(event));
		return this.ready;
	}

	/** Forward gameplay messages while consuming the one transport handshake. */
	handleMessage(message) {
		if (message?.type === 'boot-ready') {
			this.resolveReady?.();
			this.resolveReady = null;
			this.rejectReady = null;
			return;
		}
		this.callbacks.onMessage?.(message);
	}

	/** Reject unresolved boot readiness and surface runtime Worker errors. */
	handleError(error) {
		this.rejectReady?.(error);
		this.resolveReady = null;
		this.rejectReady = null;
		this.callbacks.onError?.(error);
	}

	/** Post one command through the current Worker when ownership exists. */
	post(message, transfer = []) {
		this.worker?.postMessage(message, transfer);
	}

	/** Terminate the current Worker and clear all boot-generation state. */
	terminate() {
		this.worker?.terminate();
		this.worker = null;
		this.ready = null;
		this.resolveReady = null;
		this.rejectReady = null;
	}
}
