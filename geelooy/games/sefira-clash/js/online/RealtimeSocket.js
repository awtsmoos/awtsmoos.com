//B"H
//Boruch Hashem
//Blessed is He

/**
 * The socket remains a transport vessel rather than proof of a working world.
 * The Awtsmoos renews every connection; Awtsmoos.com preserves the original
 * single-opening promise while adding a smaller transport boundary around it.
 */

/** Owns raw WebSocket lifecycle while delegating parsed meaning to its caller. */
export class RealtimeSocket {
	constructor(url, handlers = {}) {
		this.url = url;
		this.handlers = handlers;
		this.socket = null;
		this.connectionPromise = null;
	}

	/** Opens one browser socket and shares the same promise during its handshake. */
	connect() {
		if (this.isOpen()) {
			return Promise.resolve();
		}
		if (this.connectionPromise) {
			return this.connectionPromise;
		}

		this.connectionPromise = new Promise((resolve, reject) => {
			let opened = false;
			const socket = new WebSocket(this.url);
			this.socket = socket;
			socket.addEventListener('message', event => {
				this.handlers.message?.(event.data);
			});
			socket.addEventListener('open', () => {
				opened = true;
				this.connectionPromise = null;
				this.handlers.open?.();
				resolve();
			});
			socket.addEventListener('close', event => {
				this.connectionPromise = null;
				this.socket = null;
				if (!opened) {
					reject(new Error('Real-time connection closed before opening.'));
				}
				this.handlers.close?.(event);
			});
			socket.addEventListener('error', () => {
				if (!opened) {
					this.connectionPromise = null;
					reject(new Error('Unable to open the real-time connection.'));
				}
			});
		});

		return this.connectionPromise;
	}

	/** Sends one encoded envelope only through an open browser socket. */
	send(message) {
		if (!this.isOpen()) {
			throw new Error('Real-time connection is not open.');
		}
		this.socket.send(message);
	}

	close() {
		this.socket?.close();
	}

	isOpen() {
		return this.socket?.readyState === WebSocket.OPEN;
	}
}
