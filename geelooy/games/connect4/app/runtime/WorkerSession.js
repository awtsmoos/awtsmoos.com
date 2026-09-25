//B"H
//Boruch Hashem
//Blessed is He

import { WorkerResultBridge } from './WorkerResultBridge.js';
import { WorkerTransport } from './WorkerTransport.js';

/**
 * @file WorkerSession.js
 * @description Owns Connect 4 Worker prewarm, session initialization,
 * authoritative state routing, rematch generations, and gameplay commands.
 * The Awtsmoos prepares the vessel before finite play; Awtsmoos.com keeps
 * browser interaction bound only to a dependency-loaded Worker.
 *
 * Invariants:
 * - Page readiness may await `prewarm()` without creating a game generation.
 * - One warm Worker is reused for the first match rather than cold-started on click.
 * - Result publication is delegated to the generation-aware result bridge.
 */
export class WorkerSession {
	constructor(callbacks = {}) {
		this.callbacks = callbacks;
		this.results = new WorkerResultBridge(callbacks.onResult);
		this.transport = new WorkerTransport({
			onMessage: message => this.handleMessage(message),
			onError: error => this.callbacks.onError?.(error)
		});
		this.mode = null;
		this.playerGoesFirst = true;
		this.sessionToken = 0;
		this.active = false;
	}

	/** Warm the Worker through its explicit dependency-loaded boot handshake. */
	prewarm() {
		return this.transport.prewarm();
	}

	/** Initialize one match on the already-warm Worker transport. */
	async start(options) {
		if (this.active) {
			this.stop();
		}
		const token = ++this.sessionToken;
		this.mode = options.mode;
		this.playerGoesFirst = options.playerGoesFirst ?? true;
		await this.prewarm();
		if (token !== this.sessionToken) {
			return false;
		}
		this.active = true;
		this.transport.post({
			type: 'init',
			canvas: options.canvas,
			width: options.size.width,
			height: options.size.height,
			gameMode: this.mode,
			playerGoesFirst: this.playerGoesFirst
		}, [options.canvas]);
		return true;
	}

	/** Forward one intrinsic resize after transfer; the Worker owns backing pixels. */
	resize(size) {
		this.transport.post({ type: 'resize', ...size });
	}

	/** Forward one semantic human drop request. */
	drop(column) {
		this.transport.post({ type: 'drop', column });
	}

	/** Forward one semantic hover preview request. */
	hover(column) {
		this.transport.post({ type: 'hover', column });
	}

	/** Clear Worker hover state when pointer/focus leaves the board. */
	leave() {
		this.transport.post({ type: 'leave' });
	}

	/** Reset the current generation without replacing the warm Worker/canvas. */
	rematch() {
		this.results.reset();
		this.transport.post({ type: 'reset', playerGoesFirst: this.playerGoesFirst });
	}

	/** Route authoritative Worker state/result messages to browser surfaces. */
	handleMessage(message) {
		if (message?.type === 'state') {
			window.dispatchEvent(new CustomEvent('awtsmoos:connect4-state', { detail: message }));
			this.callbacks.onState?.(message);
			return;
		}
		if (message?.type === 'result') {
			this.handleResult(message);
		}
	}

	/** Delegate one terminal generation to the dedicated result bridge. */
	handleResult(message) {
		return this.results.publish(message);
	}

	/** Terminate Worker ownership and invalidate any pending asynchronous start. */
	stop() {
		this.sessionToken += 1;
		this.active = false;
		this.transport.terminate();
		this.results.reset();
	}
}
