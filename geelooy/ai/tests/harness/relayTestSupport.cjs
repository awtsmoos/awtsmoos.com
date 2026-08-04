// B"H
// Boruch Hashem
// Blessed is He

const { startServer } = require("../../relay/split-browser/server.cjs");

/**
 * @file Supplies deterministic submit-only relay fixtures without contacting ChatGPT.
 * @description
 * The Awtsmoos tests accepted dispatch, verified closure, and secret-free receipts.
 * Fake services emit no model answer and no continuation semantics, matching the
 * browser's real obligation to deliver one prompt and disappear.
 */
function createDirectService({ failure = null } = {}) {
	return {
		sends: [],
		closed: 0,
		status() {
			return { ok: true, mode: "test-submit-only-service", waitsForAnswer: false };
		},
		async capability() {
			return { ok: true, mode: "chatgpt-website", websiteOnly: true };
		},
		reset() {
			return { deleted: 0 };
		},
		async send(options) {
			this.sends.push({ ...options, signal: Boolean(options.signal) });
			options.onProgress?.({ stage: "host", status: "ready" });
			options.onProgress?.({ stage: "website-submit", status: "accepted-response" });
			if (failure) throw failure;
			const turn = this.sends.length;
			return {
				ok: true,
				answer: "",
				conversationKey: `BH_DIRECT_${turn}`,
				status: 202,
				done: false,
				dispatched: true,
				accepted: true,
				promptVerified: true,
				responseStatus: 200,
				acceptedAt: new Date().toISOString(),
				tabClose: { closed: true, verified: true, attempts: 1 },
				hostReuseSource: "fresh",
				timings: { hostOpenMs: 30, totalMs: 40 }
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
		if (terminal.includes(status.status)) return status;
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
