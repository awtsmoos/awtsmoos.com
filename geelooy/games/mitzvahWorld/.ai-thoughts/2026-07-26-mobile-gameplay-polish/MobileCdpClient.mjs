// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileCdpClient.mjs
 * @description Provides a small DevTools client with runtime and network failure evidence.
 * The Awtsmoos lets the living mobile page answer in its own browser vessel;
 * Awtsmoos.com records every exception, failed request, and HTTP wound without reloading blindly.
 */

export async function connectMobileCdp(port, requestedUrl) {
	const targets = await fetch(`http://127.0.0.1:${port}/json/list`)
		.then((response) => response.json());
	const target = targets.find((value) => value.url === requestedUrl)
		|| targets.find((value) => value.type === 'page');
	if (!target?.webSocketDebuggerUrl) {
		throw new Error(`No Chrome target exists for ${requestedUrl}`);
	}
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	const pending = new Map();
	const evidence = {
		consoleErrors: [],
		exceptions: [],
		httpErrors: [],
		requestFailures: []
	};
	let commandId = 0;
	socket.addEventListener('message', (event) => {
		const message = JSON.parse(event.data);
		captureEvent(message, evidence);
		if (!message.id || !pending.has(message.id)) return;
		const request = pending.get(message.id);
		pending.delete(message.id);
		message.error ? request.reject(message.error) : request.resolve(message.result);
	});
	await new Promise((resolve, reject) => {
		socket.addEventListener('open', resolve, { once: true });
		socket.addEventListener('error', reject, { once: true });
	});
	return {
		evidence,
		close: () => socket.close(),
		async send(method, params = {}) {
			commandId += 1;
			return new Promise((resolve, reject) => {
				pending.set(commandId, { reject, resolve });
				socket.send(JSON.stringify({ id: commandId, method, params }));
			});
		}
	};
}

export async function evaluateMobile(client, expression) {
	const response = await client.send('Runtime.evaluate', {
		awaitPromise: true,
		expression,
		returnByValue: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.text || 'Browser evaluation failed.');
	}
	return response.result.value;
}

export async function waitForMobileRuntime(client, milliseconds = 60000) {
	const started = Date.now();
	while (Date.now() - started < milliseconds) {
		const ready = await evaluateMobile(client, `(() => {
			const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
			return Boolean(runtime?.enemies && runtime?.houses && runtime?.quest && runtime?.equipment);
		})()`);
		if (ready) return true;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error(`Mobile runtime did not settle within ${milliseconds}ms.`);
}

function captureEvent(message, evidence) {
	if (message.method === 'Runtime.exceptionThrown') {
		evidence.exceptions.push(message.params.exceptionDetails?.text || 'exception');
	}
	if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
		evidence.consoleErrors.push(message.params.args?.map((arg) => arg.value || arg.description).join(' '));
	}
	if (message.method === 'Network.loadingFailed') {
		evidence.requestFailures.push(message.params.errorText || 'request failed');
	}
	if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
		evidence.httpErrors.push({
			status: message.params.response.status,
			url: message.params.response.url
		});
	}
}
