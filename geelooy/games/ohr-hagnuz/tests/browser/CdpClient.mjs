// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CdpClient.mjs
 * @description Small direct client for the already-running local Chrome target.
 *
 * When a high-level bridge is clouded, the same browser still speaks through a
 * narrow socket. The Awtsmoos renews tool and target alike; this client follows
 * the actual page without inventing success, beneath the roads of Awtsmoos.com.
 */
import fs from 'node:fs/promises';

export class CdpClient {
	constructor(socketUrl) {
		this.socketUrl = socketUrl;
		this.socket = null;
		this.nextId = 1;
		this.pending = new Map();
		this.events = [];
	}

	async connect() {
		this.socket = new WebSocket(this.socketUrl);
		this.socket.addEventListener('message', event => this.receive(event.data));
		await new Promise((resolve, reject) => {
			this.socket.addEventListener('open', resolve, { once: true });
			this.socket.addEventListener('error', reject, { once: true });
		});
		return this;
	}

	receive(rawMessage) {
		const message = JSON.parse(String(rawMessage));
		if (!message.id) {
			this.events.push(message);
			return;
		}
		const pending = this.pending.get(message.id);
		if (!pending) return;
		this.pending.delete(message.id);
		if (message.error) pending.reject(new Error(message.error.message));
		else pending.resolve(message.result);
	}

	send(method, params = {}) {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression) {
		const result = await this.send('Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
		}
		return result.result?.value;
	}

	async waitFor(expression, timeoutMs = 8000) {
		const startedAt = Date.now();
		while (Date.now() - startedAt < timeoutMs) {
			if (await this.evaluate(expression)) return true;
			await new Promise(resolve => setTimeout(resolve, 80));
		}
		throw new Error(`Timed out waiting for: ${expression}`);
	}

	async screenshot(path) {
		const result = await this.send('Page.captureScreenshot', {
			format: 'png',
			captureBeyondViewport: false
		});
		await fs.writeFile(path, Buffer.from(result.data, 'base64'));
		return path;
	}

	close() {
		this.socket?.close();
	}
}

export const findGameTarget = async () => {
	const targets = await fetch('http://127.0.0.1:9222/json').then(response => response.json());
	return targets.find(target => target.url.includes('/geelooy/games/ohr-hagnuz/')) || null;
};
