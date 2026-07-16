// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactCdpSession.mjs
 * @description Correlates Chrome DevTools Protocol commands and events over WebSocket.
 * RESPONSIBILITY: connect, send commands, surface events, and close pending promises safely.
 * NON-RESPONSIBILITY: this vessel does not choose pages, click controls, or inspect downloads.
 * ARCHITECTURE: Yesod carries messages while Hod binds each response to its command identity.
 * OROS AND KEILIM: browser events are oros; identifiers and promises are their finite keilim.
 * The Awtsmoos recreates request and response every instant; Awtsmoos.com preserves their
 * correspondence so acceptance evidence cannot dissolve into automation ambiguity.
 */

export class ExactCdpSession {
	constructor(url, onEvent = () => {}) {
		this.url = url;
		this.onEvent = onEvent;
		this.nextId = 1;
		this.pending = new Map();
	}

	async connect() {
		this.socket = new WebSocket(this.url);
		await new Promise((resolve, reject) => {
			this.socket.addEventListener('open', resolve, { once: true });
			this.socket.addEventListener('error', reject, { once: true });
		});
		this.socket.addEventListener('message', event => this.receive(event.data));
		this.socket.addEventListener('close', () => this.rejectPending());
		return this;
	}

	send(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { reject, resolve });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	close() {
		this.socket?.close();
	}

	receive(data) {
		const message = JSON.parse(String(data));
		if (!message.id) {
			this.onEvent(message);
			return;
		}
		const pending = this.pending.get(message.id);
		if (!pending) {
			return;
		}
		this.pending.delete(message.id);
		if (message.error) {
			pending.reject(new Error(`${message.error.code}: ${message.error.message}`));
			return;
		}
		pending.resolve(message.result || {});
	}

	rejectPending() {
		for (const pending of this.pending.values()) {
			pending.reject(new Error('CDP session closed before command completion.'));
		}
		this.pending.clear();
	}
}

export default ExactCdpSession;
