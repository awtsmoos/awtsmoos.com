//B"H
// Boruch Hashem
// Blessed is He

const { startServer } = require("../../relay/split-browser/server.cjs");

/**
 * Deterministic relay vessels let the Awtsmoos test Awtsmoos.com without ChatGPT.
 * The fake service records bounded public options, emits genuine stage events, and
 * returns only opaque continuation keys so privacy and lifecycle tests stay exact.
 */
function createDirectService({ failure = null } = {}) {
	return {
		sends: [],
		closed: 0,
		status() {
			return { ok: true, mode: "test-direct-service" };
		},
		async capability() {
			return { ok: true, mode: "strict-request-only" };
		},
		reset() {
			return { deleted: 0 };
		},
		async send(options) {
			this.sends.push({ ...options, signal: Boolean(options.signal) });
			options.onProgress?.({ stage: "host", status: "ready" });
			options.onProgress?.({ stage: "topic", status: "completed" });
			if (failure) {
				throw failure;
			}
			const turn = this.sends.length;
			return {
				answer: `reply ${turn}`,
				conversationKey: `BH_DIRECT_${turn}`,
				hostReuseSource: turn === 1 ? "fresh" : "reused",
				timings: { hostOpenMs: turn === 1 ? 30 : 1, totalMs: 40 }
			};
		},
		async close() {
			this.closed += 1;
		}
	};
}

async function startRelay({ directService, targetOrigin = "http://127.0.0.1:9" } = {}) {
	const server = startServer({
		port: 0,
		host: "127.0.0.1",
		targetOrigin,
		allowedOrigins: [targetOrigin],
		verbose: false,
		directService
	});
	await listening(server);
	return {
		server,
		base: `http://127.0.0.1:${server.address().port}`
	};
}

async function waitForStatus(base, conversationId, terminal, attempts = 80) {
	let status = null;
	for (let index = 0; index < attempts; index += 1) {
		status = await getJson(`${base}/automation-status?conversationId=${conversationId}`);
		if (terminal.includes(status.status)) {
			return status;
		}
		await sleep(10);
	}
	return status;
}

function postJson(url, body) {
	return fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body)
	}).then(response => response.json());
}

function getJson(url) {
	return fetch(url, { cache: "no-store" }).then(response => response.json());
}

function listening(server) {
	return server.listening
		? Promise.resolve()
		: new Promise(resolve => server.once("listening", resolve));
}

function closeServer(server) {
	return new Promise(resolve => server.close(resolve));
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	createDirectService,
	startRelay,
	waitForStatus,
	postJson,
	getJson,
	closeServer,
	listening
};
