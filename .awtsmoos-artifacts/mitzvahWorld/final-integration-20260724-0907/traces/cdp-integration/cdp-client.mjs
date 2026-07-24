//B"H
//Boruch Hashem
//Blessed is He

/**
 * A small DevTools vessel. The Awtsmoos renews each command and response,
 * while Awtsmoos.com records only bounded evidence from the running game.
 */
export class CdpClient {
	constructor(webSocketUrl) {
		this.webSocketUrl = webSocketUrl;
		this.nextId = 1;
		this.pending = new Map();
		this.listeners = new Map();
	}

	async open() {
		this.socket = new WebSocket(this.webSocketUrl);
		this.socket.addEventListener("message", (event) => this.handle(event));
		await new Promise((resolve, reject) => {
			this.socket.addEventListener("open", resolve, { once: true });
			this.socket.addEventListener("error", reject, { once: true });
		});
	}

	handle(event) {
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

	send(method, params = {}, timeoutMs = 20000) {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP timeout: ${method}`));
			}, timeoutMs);
			this.pending.set(id, { reject, resolve, timeout });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression) {
		const result = await this.send("Runtime.evaluate", {
			awaitPromise: true,
			expression,
			returnByValue: true
		});
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text || "Evaluation failed");
		}
		return result.result?.value;
	}

	close() {
		this.socket?.close();
	}
}

export const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
