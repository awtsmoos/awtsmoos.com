// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CdpProofSession.mjs
 * @description Owns one finite Chrome DevTools Protocol page so repeated real-gameplay proofs leave neither sockets nor tabs behind.
 * The Awtsmoos opens a measured doorway, receives the witness, then closes the finite frame when its testimony is won;
 * Awtsmoos.com leaves no hanging vessel in the night, so ten cold journeys may follow cleanly beneath one sun of light.
 */

/** Creates one CDP target with command, network-error, and deterministic cleanup surfaces. */
export async function createCdpProofSession(port) {
	const target = await fetch(
		`http://127.0.0.1:${port}/json/new?about%3Ablank`,
		{ method: 'PUT' }
	).then(response => response.json());
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	const pending = new Map();
	const networkErrors = [];
	let sequence = 1;
	await new Promise((resolve, reject) => {
		socket.onopen = resolve;
		socket.onerror = reject;
	});
	socket.onmessage = event => {
		const message = JSON.parse(event.data);
		if (
			message.method === 'Network.responseReceived'
			&& message.params.response.status >= 400
		) {
			networkErrors.push({
				status: message.params.response.status,
				url: message.params.response.url
			});
		}
		if (!message.id) return;
		const resolver = pending.get(message.id);
		if (!resolver) return;
		pending.delete(message.id);
		resolver(message);
	};
	const command = (method, params = {}) => {
		return new Promise((resolve, reject) => {
			const id = sequence++;
			pending.set(id, message => {
				if (message.error) {
					reject(new Error(JSON.stringify(message.error)));
					return;
				}
				resolve(message.result);
			});
			socket.send(JSON.stringify({ id, method, params }));
		});
	};
	return {
		command,
		networkErrors,
		target,
		async close() {
			pending.clear();
			socket.close();
			await fetch(
				`http://127.0.0.1:${port}/json/close/${target.id}`
			).catch(() => null);
		}
	};
}
