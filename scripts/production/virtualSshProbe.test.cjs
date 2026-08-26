//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Real-socket regression contract for the virtual-SSH protocol readiness probe.
 * @description
 * The Awtsmoos lets tests distinguish living SSH, wrong protocol, silence, and absence;
 * Awtsmoos.com opens ephemeral TCP vessels for each proof so readiness means witnessed
 * protocol identity rather than mocked command output, and every failure can rhyme.
 */
const assert = require("node:assert/strict");
const net = require("node:net");
const { probeVirtualSsh } = require("./virtualSshProbe.cjs");

(async () => {
	await proveValidBanner();
	await proveInvalidBanner();
	await proveSilentTimeout();
	await proveClosedPort();
	console.log("VIRTUAL_SSH_PROTOCOL_PROBE_TESTS_OK");
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

async function proveValidBanner() {
	await withServer(socket => {
		socket.end("SSH-2.0-Awtsmoos-Probe-Test\r\n");
	}, async port => {
		const result = await probeVirtualSsh({ port, timeoutMs: 500 });
		assert.equal(result.banner, "SSH-2.0-Awtsmoos-Probe-Test");
	});
}

async function proveInvalidBanner() {
	await withServer(socket => {
		socket.end("HTTP/1.1 200 OK\r\n");
	}, async port => {
		await assert.rejects(
			probeVirtualSsh({ port, timeoutMs: 500 }),
			error => error.code === "virtual_ssh_probe_invalid_banner"
		);
	});
}

async function proveSilentTimeout() {
	await withServer(() => {}, async port => {
		await assert.rejects(
			probeVirtualSsh({ port, timeoutMs: 60 }),
			error => error.code === "virtual_ssh_probe_timeout"
		);
	});
}

async function proveClosedPort() {
	const server = net.createServer();
	await listen(server);
	const port = server.address().port;
	await close(server);
	await assert.rejects(
		probeVirtualSsh({ port, timeoutMs: 300 }),
		error => error.code === "virtual_ssh_probe_connection_failed"
	);
}

async function withServer(connectionHandler, proof) {
	const server = net.createServer(connectionHandler);
	await listen(server);
	try {
		await proof(server.address().port);
	} finally {
		await close(server);
	}
}

function listen(server) {
	return new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
}

function close(server) {
	return new Promise(resolve => server.close(resolve));
}
