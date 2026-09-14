//B"H
//Boruch Hashem
//Blessed be He

import { chromeDebugOrigin } from './config.mjs';
import { CdpPendingRequests } from './cdp-pending.mjs';
import { evaluateCdp, waitForCdp } from './cdp-runtime.mjs';
import { waitForSocketOpen } from './native-websocket.mjs';

/**
 * @file cdp-client.mjs
 * Awtsmoos.com keeps release evidence native, bounded, and inspectable.
 * @description Dependency-free Chrome DevTools Protocol client built on native
 * fetch/WebSocket with bounded request ownership for Games release verification.
 *
 * Architectural invariants:
 * - One client owns one fresh target, one socket, one pending-request vessel.
 * - No npm/external transport participates in browser evidence.
 * - Every protocol request settles through response, timeout, or transport failure.
 * - Closing releases target, socket, and outstanding promises deterministically.
 */
export class MerkavaCdpClient {
	constructor(socket) {
		this.socket = socket;
		this.pending = new CdpPendingRequests();
		this.eventSink = null;
		this.closed = false;
		this.socket.addEventListener('message', event => this.#receive(event.data));
		this.socket.addEventListener('close', () => this.#transportClosed());
		this.socket.addEventListener('error', () => this.#transportClosed());
	}

	/** Create one isolated Chrome target using only platform networking primitives. */
	static async create() {
		const response = await fetch(`${chromeDebugOrigin}/json/new?about%3Ablank`, {
			method: 'PUT'
		});
		if (!response.ok) {
			throw new Error(`Chrome target creation failed: ${response.status}`);
		}
		const target = await response.json();
		const socket = new WebSocket(target.webSocketDebuggerUrl);
		await waitForSocketOpen(socket);
		const client = new MerkavaCdpClient(socket);
		await client.send('Runtime.enable');
		await client.send('Page.enable');
		await client.send('Network.enable');
		await client.send('Network.setCacheDisabled', { cacheDisabled: true });
		return client;
	}

	/** Route raw protocol events to one current audit sink. */
	setEventSink(sink) {
		this.eventSink = sink;
	}

	/** Send one bounded request and return its matching response. */
	send(method, params = {}) {
		if (this.closed || this.socket.readyState !== WebSocket.OPEN) {
			return Promise.reject(new Error(`CDP transport unavailable: ${method}`));
		}
		const task = this.pending.create(method);
		this.socket.send(JSON.stringify({ id: task.id, method, params }));
		return task.promise;
	}

	/** Evaluate one browser expression and return its by-value result. */
	evaluate(expression) {
		return evaluateCdp(this, expression);
	}

	/** Poll one browser predicate until success or finite timeout. */
	waitFor(predicate, timeoutMs) {
		return waitForCdp(this, predicate, timeoutMs);
	}

	/** Close target and native transport while settling outstanding work. */
	async close() {
		if (this.closed) {
			return;
		}
		try {
			await this.send('Page.close');
		} catch {
			// Chrome may close the target before acknowledging Page.close.
		}
		this.closed = true;
		this.pending.rejectAll(new Error('CDP client closed'));
		this.socket.close();
	}

	/** Resolve one response or forward one unsolicited protocol event. */
	#receive(raw) {
		const message = JSON.parse(String(raw));
		if (message.id && this.pending.settle(message)) {
			return;
		}
		this.eventSink?.(message);
	}

	/** Reject every request when Chrome or the native socket disappears. */
	#transportClosed() {
		if (this.closed) {
			return;
		}
		this.closed = true;
		this.pending.rejectAll(new Error('CDP transport closed'));
	}
}
