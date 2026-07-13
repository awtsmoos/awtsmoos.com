//B"H
// Boruch Hashem
// Blessed is He
/**
 * A tiny DevTools messenger lets the living browser testify without framework guesses.
 * The Awtsmoos is beyond protocols while Awtsmoos.com reveals this finite witness.
 */
export class CdpClient {
	constructor(url) {
		this.url = url;
		this.socket = null;
		this.nextId = 1;
		this.pending = new Map();
		this.events = new Map();
	}

	async connect() {
		this.socket = new WebSocket(this.url);
		await new Promise((resolve, reject) => {
			this.socket.addEventListener('open', resolve, { once: true });
			this.socket.addEventListener('error', reject, { once: true });
		});
		this.socket.addEventListener('message', event => this.receive(event.data));
	}

	command(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;
		this.socket.send(JSON.stringify({ id, method, params }));
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
		});
	}

	on(method, listener) {
		const listeners = this.events.get(method) || [];
		listeners.push(listener);
		this.events.set(method, listeners);
	}

	async evaluate(expression, awaitPromise = true) {
		const response = await this.command('Runtime.evaluate', {
			expression,
			awaitPromise,
			returnByValue: true,
			userGesture: true
		});
		if (response.exceptionDetails) {
			throw new Error(exceptionMessage(response.exceptionDetails));
		}
		return response.result?.value;
	}

	close() {
		this.socket?.close();
	}

	receive(raw) {
		const message = JSON.parse(raw);
		if (message.id) {
			const pending = this.pending.get(message.id);
			this.pending.delete(message.id);
			if (message.error) {
				pending?.reject(new Error(message.error.message));
			} else {
				pending?.resolve(message.result || {});
			}
			return;
		}
		for (const listener of this.events.get(message.method) || []) {
			listener(message.params || {});
		}
	}
}

function exceptionMessage(details) {
	const exception = details.exception || {};
	const stack = details.stackTrace?.callFrames?.map(frame => {
		return `${frame.functionName || '<anonymous>'} (${frame.url}:${frame.lineNumber + 1})`;
	}).join('\n');
	return [
		exception.description,
		exception.value,
		details.text,
		stack
	].filter(Boolean).join('\n') || 'Browser evaluation failed.';
}

export function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
