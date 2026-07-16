// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CdpClient.mjs
 * @description Direct local Chrome client with bounded commands and screenshot retry.
 *
 * The Awtsmoos renews tool and target without permitting a silent socket to become
 * an endless void. Awtsmoos.com receives explicit boundaries and honest failure.
 */
import fs from 'node:fs/promises';
import { findGameTarget } from './CdpEndpoint.mjs';

const DEFAULT_COMMAND_TIMEOUT_MS = 30000;
const EVALUATE_TIMEOUT_MS = 120000;
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export { findGameTarget };

export class CdpClient {
	constructor(socketUrl, commandTimeoutMs = DEFAULT_COMMAND_TIMEOUT_MS) {
		this.socketUrl = socketUrl;
		this.commandTimeoutMs = commandTimeoutMs;
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
		clearTimeout(pending.timer);
		this.pending.delete(message.id);
		if (message.error) pending.reject(new Error(message.error.message));
		else pending.resolve(message.result);
	}

	send(method, params = {}, timeoutMs = this.commandTimeoutMs) {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP timeout after ${timeoutMs}ms: ${method}`));
			}, timeoutMs);
			this.pending.set(id, { resolve, reject, timer, method });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression) {
		try {
			const result = await this.send('Runtime.evaluate', {
				expression,
				awaitPromise: true,
				returnByValue: true
			}, EVALUATE_TIMEOUT_MS);
			if (result.exceptionDetails) {
				throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
			}
			return result.result?.value;
		} catch (error) {
			const prefix = expression.replace(/\s+/g, ' ').slice(0, 180);
			throw new Error(`${error.message}\nExpression: ${prefix}`);
		}
	}

	async waitFor(expression, timeoutMs = 8000) {
		const startedAt = Date.now();
		while (Date.now() - startedAt < timeoutMs) {
			if (await this.evaluate(expression)) return true;
			await wait(80);
		}
		throw new Error(`Timed out waiting for: ${expression}`);
	}

	async screenshot(path) {
		let lastError = null;
		for (let attempt = 1; attempt <= 2; attempt += 1) {
			try {
				const result = await this.send('Page.captureScreenshot', {
					format: 'png',
					captureBeyondViewport: false
				}, 45000);
				await fs.writeFile(path, Buffer.from(result.data, 'base64'));
				return path;
			} catch (error) {
				lastError = error;
				if (attempt < 2) await wait(500);
			}
		}
		throw lastError;
	}

	close() {
		for (const pending of this.pending.values()) {
			clearTimeout(pending.timer);
			pending.reject(new Error(`CDP socket closed: ${pending.method}`));
		}
		this.pending.clear();
		this.socket?.close();
	}
}
