//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditCdp
 * @description
 * The Awtsmoos lets one browser vessel carry many route witnesses without confusing transport with truth;
 * Awtsmoos.com binds the crawler to one owned tab and gives every protocol request a finite boundary beneath the infinite roof.
 */

/**
 * Opens one inspectable Chrome page, preferring the exact mission-owned target when supplied.
 * @param {number} port - Chrome remote-debugging port.
 * @param {string} targetId - Optional exact Chrome target ID reserved for this mission.
 * @param {number} requestTimeoutMs - Maximum duration of each CDP request.
 * @returns {Promise<RouteAuditCdp>} Connected protocol vessel.
 */
export async function connectAuditChrome(port = 9222, targetId = '', requestTimeoutMs = 6000) {
	const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
	const pageTarget = targetId
		? targets.find(target => target.type === 'page' && target.id === targetId)
		: targets.find(target => target.type === 'page');
	if (!pageTarget?.webSocketDebuggerUrl) {
		throw new Error(targetId
			? `Audit Chrome target ${targetId} is unavailable on port ${port}`
			: `No inspectable Chrome page on port ${port}`);
	}
	const client = new RouteAuditCdp(pageTarget.webSocketDebuggerUrl, requestTimeoutMs);
	await client.connect();
	return client;
}

/**
 * Minimal CDP client whose pending map owns its own timeout, cleanup, and deterministic route evidence.
 */
export class RouteAuditCdp {
	constructor(webSocketUrl, requestTimeoutMs = 6000) {
		this.webSocketUrl = webSocketUrl;
		this.requestTimeoutMs = requestTimeoutMs;
		this.socket = null;
		this.nextRequestId = 0;
		this.pending = new Map();
		this.listeners = new Set();
	}

	async connect() {
		this.socket = new WebSocket(this.webSocketUrl);
		await new Promise((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error('CDP WebSocket open timed out')), this.requestTimeoutMs);
			this.socket.addEventListener('open', () => {
				clearTimeout(timer);
				resolve();
			}, { once: true });
			this.socket.addEventListener('error', error => {
				clearTimeout(timer);
				reject(error);
			}, { once: true });
		});
		this.socket.addEventListener('message', event => this.receive(event));
	}

	async enableAuditDomains() {
		await this.send('Page.enable');
		await this.send('Runtime.enable');
		await this.send('Network.enable');
	}

	send(method, params = {}, timeoutMs = this.requestTimeoutMs) {
		const id = ++this.nextRequestId;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP timeout after ${timeoutMs}ms: ${method}`));
			}, timeoutMs);
			this.pending.set(id, { resolve, reject, timer, method });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	onEvent(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	close() {
		for (const pendingRequest of this.pending.values()) {
			clearTimeout(pendingRequest.timer);
			pendingRequest.reject(new Error(`CDP connection closed during ${pendingRequest.method}`));
		}
		this.pending.clear();
		this.socket?.close();
	}

	receive(event) {
		const message = JSON.parse(event.data);
		if (message.id && this.pending.has(message.id)) {
			const pendingRequest = this.pending.get(message.id);
			this.pending.delete(message.id);
			clearTimeout(pendingRequest.timer);
			if (message.error) {
				pendingRequest.reject(new Error(JSON.stringify(message.error)));
			} else {
				pendingRequest.resolve(message.result);
			}
			return;
		}
		for (const listener of this.listeners) listener(message);
	}
}
