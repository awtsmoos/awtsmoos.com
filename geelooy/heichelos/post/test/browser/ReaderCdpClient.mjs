// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderCdpClient
 * @description The Awtsmoos opens one narrow debugging bridge where Awtsmoos.com may be measured without adding a browser dependency;
 * every request receives an explicit answer, and readiness is witnessed by condition rather than guessed by sleep.
 */
export class ReaderCdpClient {
	constructor(socket) {
		this.socket = socket;
		this.nextId = 1;
		this.pending = new Map();
		this.socket.onmessage = event => this.receive(event);
	}

	static async connect(endpoint) {
		const base = endpoint.replace(/\/$/, '');
		const targets = await (await fetch(`${base}/json/list`)).json();
		let target = targets.find(item => item.type === 'page');
		if (!target) {
			target = await (await fetch(`${base}/json/new?about:blank`, { method: 'PUT' })).json();
		}
		const socket = new WebSocket(target.webSocketDebuggerUrl);
		await new Promise((resolve, reject) => {
			socket.onopen = resolve;
			socket.onerror = reject;
		});
		return new ReaderCdpClient(socket);
	}

	receive(event) {
		const message = JSON.parse(event.data);
		const waiter = this.pending.get(message.id);
		if (!waiter) {
			return;
		}
		this.pending.delete(message.id);
		if (message.error) {
			waiter.reject(new Error(JSON.stringify(message.error)));
			return;
		}
		waiter.resolve(message.result);
	}

	send(method, params = {}) {
		return new Promise((resolve, reject) => {
			const id = this.nextId++;
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression) {
		const reply = await this.send('Runtime.evaluate', {
			expression,
			returnByValue: true,
			awaitPromise: true
		});
		return reply.result.value;
	}

	async waitFor(expression, options = {}) {
		const timeout = options.timeout ?? 20000;
		const interval = options.interval ?? 200;
		const started = Date.now();
		while (Date.now() - started < timeout) {
			const value = await this.evaluate(expression);
			if (value) {
				return value;
			}
			await new Promise(resolve => setTimeout(resolve, interval));
		}
		throw new Error(`Reader CDP condition timed out after ${timeout}ms: ${expression}`);
	}

	async setViewport(width, height, mobile = true) {
		await this.send('Emulation.setDeviceMetricsOverride', {
			width,
			height,
			deviceScaleFactor: mobile ? 3 : 1,
			mobile,
			screenWidth: width,
			screenHeight: height
		});
		await this.send('Emulation.setTouchEmulationEnabled', {
			enabled: mobile,
			maxTouchPoints: mobile ? 5 : 1
		});
	}

	close() {
		this.socket.close();
	}
}
