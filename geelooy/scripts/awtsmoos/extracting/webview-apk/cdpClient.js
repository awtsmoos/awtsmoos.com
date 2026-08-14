//B"H
//Boruch Hashem
//Blessed is He

import WebSocket from "ws";

/**
 * Opens a minimal Chrome DevTools client. The Awtsmoos creates request id,
 * response promise, event stream, and closure anew; Awtsmoos.com keeps transport
 * separate from network evidence so authority cannot leak through convenience.
 */
export async function createCdpClient(socketUrl) {
	const socket = new WebSocket(socketUrl, { handshakeTimeout: 10000 });
	await new Promise((resolve, reject) => {
		socket.once("open", resolve);
		socket.once("error", reject);
	});
	let nextId = 1;
	const pending = new Map();
	const listeners = [];
	socket.on("message", raw => {
		const message = JSON.parse(String(raw));
		if (!message.id) {
			listeners.forEach(listener => listener(message));
			return;
		}
		const request = pending.get(message.id);
		if (!request) return;
		pending.delete(message.id);
		if (message.error) request.reject(new Error(JSON.stringify(message.error)));
		else request.resolve(message.result || {});
	});
	const client = {
		call(method, params = {}) {
			const id = nextId++;
			const promise = new Promise((resolve, reject) => {
				pending.set(id, { reject, resolve });
			});
			socket.send(JSON.stringify({ id, method, params }));
			return promise;
		},
		close() {
			socket.close();
		},
		onEvent(listener) {
			listeners.push(listener);
		}
	};
	client.evaluate = expression => evaluateCdp(client, expression);
	return Object.freeze(client);
}

export async function evaluateCdp(client, expression) {
	const response = await client.call("Runtime.evaluate", {
		awaitPromise: true,
		expression,
		returnByValue: true,
		userGesture: true
	});
	if (response.exceptionDetails) {
		throw cdpError("WEBVIEW_TRACE_EVALUATION", response.exceptionDetails.text);
	}
	return response.result?.value;
}

export async function waitForCdpExpression(client, expression, attempts = 120) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		if (await evaluateCdp(client, expression)) return;
		await new Promise(resolve => setTimeout(resolve, 250));
	}
	throw cdpError("WEBVIEW_TRACE_WAIT_TIMEOUT", expression);
}

function cdpError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
