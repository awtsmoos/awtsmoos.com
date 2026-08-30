// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CdpProofSession.mjs
 * @description Owns one finite Chrome DevTools Protocol witness and records every browser-level failure that can invalidate a real release.
 * The Awtsmoos opens one measured doorway and closes it when the testimony is won;
 * Awtsmoos.com leaves no hidden exception, failed request, or console cry outside the witness beneath the same sun.
 */

/** Creates one CDP target with command, failure evidence, compatibility surfaces, and deterministic cleanup. */
export async function createCdpProofSession(port) {
	const target = await fetch(
		`http://127.0.0.1:${port}/json/new?about%3Ablank`,
		{ method: 'PUT' }
	).then(response => response.json());
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	const pending = new Map();
	const evidence = {
		consoleErrors: [],
		loadingFailures: [],
		networkErrors: [],
		runtimeExceptions: []
	};
	let sequence = 1;
	await new Promise((resolve, reject) => {
		socket.onopen = resolve;
		socket.onerror = reject;
	});
	socket.onmessage = event => handleMessage(
		JSON.parse(event.data),
		pending,
		evidence
	);
	const command = (method, params = {}) => sendCommand(
		socket,
		pending,
		sequence++,
		method,
		params
	);
	return {
		command,
		evidence,
		networkErrors: evidence.networkErrors,
		target,
		async close() {
			pending.clear();
			socket.close();
			await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`)
				.catch(() => null);
		}
	};
}

/** Routes one browser event into the release evidence ledger or command resolver. */
function handleMessage(message, pending, evidence) {
	if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
		evidence.networkErrors.push({
			status: message.params.response.status,
			url: message.params.response.url
		});
	}
	if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
		evidence.loadingFailures.push({
			errorText: message.params.errorText,
			type: message.params.type
		});
	}
	if (message.method === 'Runtime.exceptionThrown') {
		const details = message.params.exceptionDetails;
		evidence.runtimeExceptions.push(
			details.exception?.description || details.text || 'Runtime exception'
		);
	}
	if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
		evidence.consoleErrors.push(consoleMessage(message.params.args));
	}
	if (message.method === 'Log.entryAdded' && message.params.entry?.level === 'error') {
		evidence.consoleErrors.push(message.params.entry.text || 'Browser log error');
	}
	if (!message.id) return;
	const resolver = pending.get(message.id);
	if (!resolver) return;
	pending.delete(message.id);
	resolver(message);
}

/** Sends one CDP command without leaking shell or browser ownership. */
function sendCommand(socket, pending, id, method, params) {
	return new Promise((resolve, reject) => {
		pending.set(id, message => {
			if (message.error) {
				reject(new Error(JSON.stringify(message.error)));
				return;
			}
			resolve(message.result);
		});
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/** Converts console remote objects into one bounded diagnostic sentence. */
function consoleMessage(args = []) {
	return args.map(argument => {
		return String(argument.value ?? argument.description ?? argument.type ?? 'unknown');
	}).join(' ');
}
