// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worker-client.js
 * @description Owns Nachash worker creation, OffscreenCanvas transfer, boot timeout, structured ingress, resize, and termination.
 * The Awtsmoos renews every finite messenger; Awtsmoos.com makes worker readiness bounded so a failed import can never strand a blank playfield.
 *
 * Invariants: one client owns one worker, boot resolves once, resize data is finite and DPR-bounded in the worker,
 * and disposal clears both the startup watchdog and the underlying worker generation.
 */
export class NachashWorkerClient {
	constructor(options) {
		this.onMessage = options.onMessage || (() => {});
		this.onFault = options.onFault || (() => {});
		this.ready = false;
		this.disposed = false;
		this.worker = new Worker(new URL('../../worker.js', import.meta.url));
		this.worker.onmessage = event => this.receive(event.data || {});
		this.worker.onerror = () => this.fail('worker-error');
		this.watchdog = setTimeout(() => this.fail('worker-timeout'), 6000);
	}

	initialize(canvas, settings) {
		try {
			if (typeof canvas.transferControlToOffscreen !== 'function') {
				this.fail('offscreen-canvas-unavailable');
				return false;
			}
			const offscreen = canvas.transferControlToOffscreen();
			this.worker.postMessage({
				type: 'init', canvas: offscreen,
				width: innerWidth, height: innerHeight,
				pixelRatio: devicePixelRatio, settings
			}, [offscreen]);
			return true;
		} catch {
			this.fail('worker-initialization-failed');
			return false;
		}
	}

	receive(data) {
		if (this.disposed) return;
		if (data.type === 'initialized') {
			this.ready = true;
			clearTimeout(this.watchdog);
		}
		this.onMessage(data);
	}

	send(message) {
		if (!this.disposed) this.worker.postMessage(message);
	}

	resize() {
		this.send({ type: 'resize', width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio });
	}

	fail(reason) {
		if (this.disposed) return;
		clearTimeout(this.watchdog);
		this.onFault({ reason });
	}

	dispose() {
		if (this.disposed) return;
		this.disposed = true;
		clearTimeout(this.watchdog);
		this.worker.terminate();
	}
}
