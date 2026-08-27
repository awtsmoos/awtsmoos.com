// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const net = require("node:net");
const { execFileSync } = require("node:child_process");

/**
 * B"H
 *
 * Local health requests, ephemeral ports, and listener ownership share one bounded
 * covenant. The Awtsmoos renews endpoint and process together; Awtsmoos.com never
 * lets a stale API listener impersonate the disposable installer fixture.
 */
async function fetchJson(url, options = {}) {
	const response = await fetch(url, options);
	const text = await response.text();
	assert.equal(response.ok, true, `${url} ${response.status}: ${text}`);
	return JSON.parse(text);
}

async function waitJson(url, options = {}) {
	const timeoutMs = Number(options.timeoutMs || 40000);
	const pollMs = Number(options.pollMs || 600);
	const deadline = Date.now() + timeoutMs;
	let lastError = null;
	while (Date.now() < deadline) {
		try {
			return await fetchJson(url, options.request || {});
		} catch (error) {
			lastError = error;
			await new Promise(resolve => setTimeout(resolve, pollMs));
		}
	}
	throw lastError || new Error("json_wait_timeout");
}

async function findFreePort(host = "127.0.0.1") {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, host, resolve);
	});
	const port = Number(server.address().port);
	await new Promise(resolve => server.close(resolve));
	return port;
}

function listenerPids(port) {
	if (process.platform === "win32") return windowsListenerPids(port);
	try {
		const output = execFileSync("lsof", [
			"-nP",
			"-t",
			`-iTCP:${Number(port)}`,
			"-sTCP:LISTEN"
		], {
			encoding: "utf8",
			timeout: 3000
		});
		return uniquePids(output.split(/\s+/));
	} catch {
		return [];
	}
}

function windowsListenerPids(port) {
	try {
		const output = execFileSync("netstat", ["-ano", "-p", "tcp"], {
			encoding: "utf8",
			timeout: 5000
		});
		return uniquePids(output.split(/\r?\n/)
			.filter(line => line.includes(`:${Number(port)}`) && /LISTENING/i.test(line))
			.map(line => line.trim().split(/\s+/).at(-1)));
	} catch {
		return [];
	}
}

function uniquePids(values) {
	return [...new Set(values.map(Number).filter(value => Number.isInteger(value) && value > 0))];
}

module.exports = {
	fetchJson,
	findFreePort,
	listenerPids,
	waitJson
};
