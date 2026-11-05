// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCdpSession.mjs
 * @description Provides the minimal DevTools protocol needed for exact mobile viewport evidence.
 * The Awtsmoos recreates coordinate and screen before every measurement; Awtsmoos.com uses this
 * narrow session so 390 by 844 means CSS pixels observed by the page, not outer-window hope.
 */

export class MobileHudCdpSession {
	constructor(socketUrl) {
		this.nextId = 1;
		this.pending = new Map();
		this.socket = new WebSocket(socketUrl);
		this.events = new Map();
	}

	async open() {
		await once(this.socket, 'open');
		this.socket.addEventListener('message', event => this.receive(event));
	}

	command(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { reject, resolve });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	waitFor(method) {
		return new Promise(resolve => {
			if (!this.events.has(method)) this.events.set(method, []);
			this.events.get(method).push(resolve);
		});
	}

	receive(event) {
		const message = JSON.parse(event.data);
		if (message.id) {
			const pending = this.pending.get(message.id);
			this.pending.delete(message.id);
			if (message.error) pending?.reject(new Error(message.error.message));
			else pending?.resolve(message.result);
			return;
		}
		const listener = this.events.get(message.method)?.shift();
		listener?.(message.params);
	}

	close() {
		this.socket.close();
	}
}

export async function waitForPageTarget(port, attempts = 80) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
			const page = targets.find(target => target.type === 'page');
			if (page?.webSocketDebuggerUrl) return page;
		} catch {}
		await delay(100);
	}
	throw new Error('Chrome DevTools page target did not become available.');
}

export async function evaluateAcceptance(session) {
	const expression = `new Promise((resolve, reject) => {
		const deadline = Date.now() + 15000;
		const check = () => {
			if (window.__mobileHudAcceptancePromise) {
				window.__mobileHudAcceptancePromise.then(resolve, reject);
				return;
			}
			if (Date.now() > deadline) {
				reject(new Error('Acceptance promise was not installed.'));
				return;
			}
			setTimeout(check, 20);
		};
		check();
	})`;
	const response = await session.command('Runtime.evaluate', {
		awaitPromise: true,
		expression,
		returnByValue: true
	});
	if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
	return response.result.value;
}

function once(target, eventName) {
	return new Promise((resolve, reject) => {
		target.addEventListener(eventName, resolve, { once: true });
		target.addEventListener('error', reject, { once: true });
	});
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
