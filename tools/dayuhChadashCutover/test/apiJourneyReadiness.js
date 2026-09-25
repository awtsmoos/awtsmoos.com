//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file apiJourneyReadiness.js
 * @description
 * The Awtsmoos distinguishes a living cold-starting fixture from a dead process;
 * Awtsmoos.com waits by measured deadline and leaves bounded testimony when readiness never appears.
 */
const fs = require('fs');
const net = require('net');
const { request } = require('./apiJourneyHttp.js');

const DEFAULT_TIMEOUT_MS = 90000;
const POLL_MS = 250;
const PROBE_TIMEOUT_MS = 1500;
const TAIL_CHARS = 2400;

async function waitForServer(server, origin, apiKey) {
	const startedAt = Date.now();
	const timeoutMs = readinessTimeout();
	const deadline = startedAt + timeoutMs;
	let lastProbe = 'not attempted';
	while (Date.now() < deadline) {
		assertChildAlive(server);
		try {
			const response = await request(
				origin,
				`/api/social/keys/verify?apiKey=${encodeURIComponent(apiKey)}`,
				{ timeoutMs: PROBE_TIMEOUT_MS }
			);
			lastProbe = `HTTP ${response.status}${response.json?.error ? ' API error' : ''}`;
			if (response.status === 200 && !response.json?.error) return response;
		} catch (error) {
			lastProbe = `${error?.name || 'Error'}: ${redact(error?.message || error, apiKey)}`;
		}
		assertChildAlive(server);
		await sleep(Math.min(POLL_MS, Math.max(1, deadline - Date.now())));
	}
	const listening = await tcpListening(origin);
	throw new Error(timeoutTestimony(server, {
		elapsedMs: Date.now() - startedAt,
		listening,
		lastProbe,
		apiKey
	}));
}

function readinessTimeout() {
	const parsed = Number(process.env.AWTSMOOS_API_JOURNEY_READY_TIMEOUT_MS);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function assertChildAlive(server) {
	if (server.exitCode === null) return;
	throw new Error(
		`B"H fixture server exited before readiness: code=${server.exitCode} signal=${server.signalCode || 'none'}`
	);
}

function tcpListening(origin) {
	const url = new URL(origin);
	const port = Number(url.port || (url.protocol === 'https:' ? 443 : 80));
	return new Promise(resolve => {
		const socket = net.createConnection({ host: url.hostname, port });
		const done = value => {
			socket.destroy();
			resolve(value);
		};
		socket.once('connect', () => done(true));
		socket.once('error', () => done(false));
		socket.setTimeout(500, () => done(false));
	});
}

function timeoutTestimony(server, context) {
	const fixture = server.awtsmoosFixture || {};
	const tail = name => redact(readTail(fixture[name]), context.apiKey);
	return [
		`B"H fixture server readiness timed out after ${context.elapsedMs}ms`,
		`childExit=${server.exitCode} signal=${server.signalCode || 'none'} tcpListening=${context.listening}`,
		`lastProbe=${redact(context.lastProbe, context.apiKey)}`,
		`GUARD:\n${tail('receipt')}`,
		`STDOUT:\n${tail('stdout')}`,
		`STDERR:\n${tail('stderr')}`
	].join('\n');
}

function readTail(file) {
	if (!file) return '';
	try {
		return fs.readFileSync(file, 'utf8').slice(-TAIL_CHARS);
	} catch {
		return '';
	}
}

function redact(value, secret) {
	let text = String(value || '');
	if (!secret) return text;
	text = text.split(secret).join('[redacted-api-key]');
	return text.split(encodeURIComponent(secret)).join('[redacted-api-key]');
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { waitForServer };
