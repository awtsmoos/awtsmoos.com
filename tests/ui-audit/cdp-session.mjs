// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview
 * Owns one bounded Chrome DevTools Protocol connection for Awtsmoos.com UI
 * verification. The session is a Yesod bridge: browser events are oros, while
 * commands, deadlines, and teardown are keilim. The Awtsmoos renews browser,
 * page, and observer each instant without granting any connection permanence.
 */

const DEFAULT_COMMAND_TIMEOUT_MS = 10000;

/**
 * Opens an isolated browser target and exposes deadline-bound CDP helpers.
 *
 * @param {object} options Connection options.
 * @param {string} options.debugUrl Chrome remote-debugging origin.
 * @param {string} options.initialUrl Initial target URL.
 * @returns {Promise<object>} A bounded session with evaluation, navigation,
 *  viewport, event, and teardown operations.
 */
export async function openCdpSession({ debugUrl, initialUrl }) {
	const targetResponse = await fetch(
		`${debugUrl}/json/new?${encodeURIComponent(initialUrl)}`,
		{
			method: 'PUT',
			signal: AbortSignal.timeout(DEFAULT_COMMAND_TIMEOUT_MS)
		}
	);
	const target = await targetResponse.json();
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await waitForSocket(socket);

	let sequence = 0;
	const pendingCommands = new Map();
	const observedEvents = [];
	const nextId = () => {
		sequence += 1;
		return sequence;
	};

	socket.addEventListener('message', event => {
		const message = JSON.parse(event.data);
		if (message.id && pendingCommands.has(message.id)) {
			settleCommand(pendingCommands, message);
			return;
		}
		observeEvent(observedEvents, message);
	});
	socket.addEventListener('close', () => {
		rejectPendingCommands(pendingCommands, new Error('CDP socket closed'));
	});
	socket.addEventListener('error', () => {
		rejectPendingCommands(pendingCommands, new Error('CDP socket failed'));
	});

	const send = createSender(socket, pendingCommands, nextId);
	await Promise.all([
		send('Runtime.enable'),
		send('Page.enable'),
		send('Log.enable'),
		send('Network.enable')
	]);

	return createSessionApi(socket, send, observedEvents);
}

function createSessionApi(socket, send, observedEvents) {
	return {
		clearEvents() {
			observedEvents.length = 0;
		},
		readEvents() {
			return [...observedEvents];
		},
		async evaluate(expression) {
			const response = await send('Runtime.evaluate', {
				expression,
				returnByValue: true,
				awaitPromise: true
			});
			if (response.exceptionDetails) {
				throw new Error(response.exceptionDetails.text || 'Runtime evaluation failed');
			}
			return response.result.value;
		},
		async navigate(url, timeoutMs = 12000) {
			await send('Page.navigate', { url });
			return waitForInteractiveDocument(send, timeoutMs);
		},
		async setViewport({ width, height, mobile }) {
			await send('Emulation.setDeviceMetricsOverride', {
				width,
				height,
				deviceScaleFactor: 1,
				mobile
			});
		},
		close() {
			socket.close();
		}
	};
}

function waitForSocket(socket) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error('CDP socket open timed out'));
		}, DEFAULT_COMMAND_TIMEOUT_MS);
		socket.addEventListener('open', () => {
			clearTimeout(timeout);
			resolve();
		}, { once: true });
		socket.addEventListener('error', () => {
			clearTimeout(timeout);
			reject(new Error('CDP socket failed to open'));
		}, { once: true });
	});
}

function createSender(socket, pendingCommands, nextId) {
	return (method, params = {}) => {
		const id = nextId();
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				pendingCommands.delete(id);
				reject(new Error(`CDP command timed out: ${method}`));
			}, DEFAULT_COMMAND_TIMEOUT_MS);
			pendingCommands.set(id, {
				resolve,
				reject,
				timeout
			});
			socket.send(JSON.stringify({ id, method, params }));
		});
	};
}

function settleCommand(pendingCommands, message) {
	const waiter = pendingCommands.get(message.id);
	pendingCommands.delete(message.id);
	clearTimeout(waiter.timeout);
	if (message.error) {
		waiter.reject(new Error(JSON.stringify(message.error)));
		return;
	}
	waiter.resolve(message.result);
}

function rejectPendingCommands(pendingCommands, error) {
	for (const waiter of pendingCommands.values()) {
		clearTimeout(waiter.timeout);
		waiter.reject(error);
	}
	pendingCommands.clear();
}

function observeEvent(observedEvents, message) {
	if (message.method === 'Runtime.exceptionThrown') {
		observedEvents.push({ type: 'exception', text: message.params.exceptionDetails.text });
	}
	if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
		observedEvents.push({ type: 'console-error', text: message.params.entry.text });
	}
	if (message.method === 'Network.loadingFailed') {
		observedEvents.push({ type: 'network-failed', text: message.params.errorText });
	}
	if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
		observedEvents.push({
			type: 'http-error',
			status: message.params.response.status,
			url: message.params.response.url
		});
	}
}

async function waitForInteractiveDocument(send, timeoutMs) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		const response = await send('Runtime.evaluate', {
			expression: `document.readyState === 'interactive' || document.readyState === 'complete'`,
			returnByValue: true
		});
		if (response.result.value) {
			return true;
		}
		await new Promise(resolve => setTimeout(resolve, 250));
	}
	return false;
}
