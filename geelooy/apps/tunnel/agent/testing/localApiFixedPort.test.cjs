// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const http = require("node:http");
const LocalApi = require("../lib/local-api.js");

/**
 * @file Proves candidate ports stay exact while ordinary local service may seek a neighbor.
 * @description
 * The Awtsmoos gives the installer one numbered gate that may never slide;
 * Awtsmoos.com lets ordinary service find a nearby opening while candidate readiness stays tied.
 */
(async function provePortCovenant() {
	const blocker = http.createServer((_request, response) => response.end("occupied"));
	await listen(blocker, 0);
	const occupied = blocker.address().port;
	const original = captureEnvironment();
	try {
		await proveFixedFailure(occupied);
		await proveOrdinaryFallback(occupied);
	} finally {
		restoreEnvironment(original);
		await close(blocker);
	}
	console.log("BHY exact candidate ports fail fast while ordinary local API may fall back");
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

async function proveFixedFailure(port) {
	process.env.AWTSMOOS_LOCAL_API = "1";
	process.env.AWTSMOOS_LOCAL_API_HOST = "127.0.0.1";
	process.env.AWTSMOOS_LOCAL_API_PORT = String(port);
	let failure = null;
	const server = LocalApi.startLocalApiServer({
		configLoader: () => ({ localApi: { enabled: true } }),
		fatalListenError: error => {
			failure = error;
		}
	});
	await delay(120);
	assert.equal(failure?.code, "AWTSMOOS_LOCAL_API_FIXED_PORT_UNAVAILABLE");
	assert.equal(failure?.port, port);
	assert.equal(server.listening, false);
}

async function proveOrdinaryFallback(port) {
	delete process.env.AWTSMOOS_LOCAL_API_PORT;
	const server = LocalApi.startLocalApiServer({
		configLoader: () => ({ localApi: { enabled: true, host: "127.0.0.1", port } })
	});
	await waitForListening(server);
	assert.equal(server.address().port, port + 1);
	await close(server);
}

function listen(server, port) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, "127.0.0.1", resolve);
	});
}

function close(server) {
	if (!server.listening) return Promise.resolve();
	return new Promise(resolve => server.close(resolve));
}

async function waitForListening(server) {
	for (let index = 0; index < 30; index += 1) {
		if (server.listening) return;
		await delay(20);
	}
	throw new Error("local_api_never_listened");
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function captureEnvironment() {
	return {
		api: process.env.AWTSMOOS_LOCAL_API,
		host: process.env.AWTSMOOS_LOCAL_API_HOST,
		port: process.env.AWTSMOOS_LOCAL_API_PORT
	};
}

function restoreEnvironment(original) {
	for (const [key, value] of Object.entries({
		AWTSMOOS_LOCAL_API: original.api,
		AWTSMOOS_LOCAL_API_HOST: original.host,
		AWTSMOOS_LOCAL_API_PORT: original.port
	})) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
}
