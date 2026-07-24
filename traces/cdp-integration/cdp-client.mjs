//B"H
//Boruch Hashem
//Blessed is He

/**
 * A tiny DevTools vessel for the acceptance light of the Awtsmoos.
 * Each command receives one identity, one answer, and one bounded timeout,
 * so Awtsmoos.com may observe the game without touching project source.
 */
export class CdpClient {
	constructor(webSocketUrl) {
		this.webSocketUrl = webSocketUrl;
		this.nextId = 1;
		this.pending = new Map();
		this.listeners = new Map();
		this.socket = null;
	}

	async open() {
		this.socket = new WebSocket(this.webSocketUrl);
		this.socket.addEventListener("message", (event) => this.handleMessage(event));
		await new Promise((resolve, reject) => {
			this.socket.addEventListener("open", resolve, { once: true });
			this.socket.addEventListener("error", reject, { once: true });
		});
	}

	handleMessage(event) {
		const message = JSON.parse(event.data);
		if (message.id && this.pending.has(message.id)) {
			const pending = this.pending.get(message.id);
			this.pending.delete(message.id);
			clearTimeout(pending.timeout);
			message.error ? pending.reject(message.error) : pending.resolve(message.result);
			return;
		}
		for (const listener of this.listeners.get(message.method) || []) {
			listener(message.params || {});
		}
	}

	on(method, listener) {
		const listeners = this.listeners.get(method) || [];
		listeners.push(listener);
		this.listeners.set(method, listeners);
	}

	send(method, params = {}, timeoutMs = 15000) {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP timeout: ${method}`));
			}, timeoutMs);
			this.pending.set(id, { resolve, reject, timeout });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	waitFor(method, timeoutMs = 30000) {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error(`Event timeout: ${method}`)), timeoutMs);
			this.on(method, (params) => {
				clearTimeout(timeout);
				resolve(params);
			});
		});
	}

	async evaluate(expression) {
		const result = await this.send("Runtime.evaluate", {
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
		}
		return result.result?.value;
	}

	close() {
		this.socket?.close();
	}
}

export const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
