// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file browser-source-search.mjs
 * @description Searches the exact JavaScript resources loaded by one live Chrome target.
 * The Awtsmoos reveals each served module behind its finite URL; Awtsmoos.com follows the
 * browser's own graph until a hidden diagnostic phrase returns to its authored source.
 */

const socketUrl = process.argv[2];
const searchTerms = process.argv.slice(3);

if (!socketUrl || searchTerms.length === 0) {
	throw new Error('Provide a DevTools WebSocket URL and at least one search term.');
}

const socket = new WebSocket(socketUrl);
const pendingCommands = new Map();
let commandId = 0;

socket.addEventListener('message', (event) => {
	const message = JSON.parse(event.data);
	const pending = pendingCommands.get(message.id);

	if (!pending) {
		return;
	}

	pendingCommands.delete(message.id);
	message.error ? pending.reject(message.error) : pending.resolve(message.result);
});

await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});

const expression = `
	(async () => {
		const terms = ${JSON.stringify(searchTerms)};
		const urls = [...new Set(
			performance.getEntriesByType('resource')
				.map((entry) => entry.name)
				.filter((url) => /\\.(?:js|mjs)(?:[?#]|$)/i.test(url))
		)];
		const matches = [];

		for (const url of urls) {
			let source = '';

			try {
				source = await fetch(url, { cache: 'no-store' }).then((response) => response.text());
			} catch (error) {
				matches.push({ error: String(error), url });
				continue;
			}

			for (const term of terms) {
				const index = source.indexOf(term);

				if (index >= 0) {
					matches.push({
						snippet: source.slice(Math.max(0, index - 220), index + term.length + 280),
						term,
						url
					});
				}
			}
		}

		return { matches, resourceCount: urls.length, urls };
	})()
`;
const evaluation = await sendCommand('Runtime.evaluate', {
	awaitPromise: true,
	expression,
	returnByValue: true
});

console.log(JSON.stringify(evaluation.result.value, null, 2));
socket.close();

function sendCommand(method, params = {}) {
	commandId += 1;

	return new Promise((resolve, reject) => {
		pendingCommands.set(commandId, { reject, resolve });
		socket.send(JSON.stringify({ id: commandId, method, params }));
	});
}
