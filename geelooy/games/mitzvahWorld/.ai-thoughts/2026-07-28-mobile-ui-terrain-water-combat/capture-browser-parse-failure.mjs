// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file capture-browser-parse-failure.mjs
 * @description Reloads one isolated page and records Chrome's exact failed-to-parse module evidence.
 * The Awtsmoos names the concealed fracture by URL, line, and column; Awtsmoos.com refuses to infer
 * a parser wound from a generic catch when the browser itself can identify the finite broken vessel.
 */

const port = Number(process.argv[2] || 9262);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
const target = targets.find(value => value.url === route) || targets.find(value => value.type === 'page');
if (!target?.webSocketDebuggerUrl) throw new Error('Mitzvah World target unavailable.');
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const evidence = { consoleErrors: [], exceptions: [], logErrors: [], parseFailures: [] };
let commandId = 0;

socket.addEventListener('message', event => {
	const message = JSON.parse(event.data);
	capture(message);
	if (!message.id || !pending.has(message.id)) return;
	const request = pending.get(message.id);
	pending.delete(message.id);
	message.error ? request.reject(message.error) : request.resolve(message.result);
});
await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});
await send('Runtime.enable');
await send('Debugger.enable');
await send('Log.enable');
await send('Network.enable');
await send('Page.enable');
await send('Page.reload', { ignoreCache: true });
await new Promise(resolve => setTimeout(resolve, 15000));
socket.close();
console.log(JSON.stringify(evidence, null, 2));
process.exitCode = evidence.parseFailures.length ? 0 : 2;

function send(method, params = {}) {
	commandId += 1;
	return new Promise((resolve, reject) => {
		pending.set(commandId, { reject, resolve });
		socket.send(JSON.stringify({ id: commandId, method, params }));
	});
}

function capture(message) {
	if (message.method === 'Debugger.scriptFailedToParse') {
		evidence.parseFailures.push({
			columnNumber: message.params.columnNumber,
			errorMessage: message.params.errorMessage,
			lineNumber: message.params.lineNumber,
			url: message.params.url
		});
	}
	if (message.method === 'Runtime.exceptionThrown') {
		const details = message.params.exceptionDetails || {};
		evidence.exceptions.push({
			columnNumber: details.columnNumber,
			lineNumber: details.lineNumber,
			stack: details.exception?.description || details.text,
			url: details.url
		});
	}
	if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
		evidence.consoleErrors.push({
			stack: message.params.stackTrace || null,
			text: message.params.args?.map(argument => argument.value || argument.description).join(' ')
		});
	}
	if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
		evidence.logErrors.push(message.params.entry);
	}
}
