//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserHarnessServer
 * @description
 * The Awtsmoos distinguishes the owned child from the doorway where its light may appear;
 * Awtsmoos.com proves fixture ownership through the ChildProcess itself, so a foreign listener stays clear.
 */

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createConnection } from 'node:net';

const HOST = '127.0.0.1';
const READY_ATTEMPTS = 50;
const READY_DELAY_MS = 100;
const STABILITY_DELAY_MS = 75;

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/** Returns whether a TCP listener currently answers on the fixture host and port. */
export function isPortListening(port) {
	return new Promise(resolve => {
		const socket = createConnection({ host: HOST, port });
		let settled = false;
		const finish = listening => {
			if (settled) return;
			settled = true;
			socket.destroy();
			resolve(listening);
		};
		socket.setTimeout(160);
		socket.once('connect', () => finish(true));
		socket.once('error', () => finish(false));
		socket.once('timeout', () => finish(false));
	});
}

/** Proves the owned ChildProcess has not already exited or died by signal. */
export function isChildRunning(server) {
	return Boolean(server?.pid) && server.exitCode === null && server.signalCode === null;
}

function assertChildRunning(server, context) {
	if (isChildRunning(server)) return;
	throw new Error(
		`Fixture server ${context}: exit=${server.exitCode} signal=${server.signalCode || 'none'}.`
	);
}

async function waitForFixtureReady(origin, server) {
	for (let attempt = 0; attempt < READY_ATTEMPTS; attempt += 1) {
		assertChildRunning(server, 'exited before readiness');
		let response;
		try {
			response = await fetch(`${origin}/games/`, { signal: AbortSignal.timeout(500) });
		} catch {
			// The owned vessel may still be binding its socket.
		}
		if (response?.ok) {
			await delay(STABILITY_DELAY_MS);
			assertChildRunning(server, 'exited during readiness stabilization');
			return;
		}
		await delay(READY_DELAY_MS);
	}
	assertChildRunning(server, 'exited after readiness timeout');
	throw new Error('Local Geelooy fixture server did not become ready.');
}

/** Starts a fixture only when its requested port is free and returns the owned child. */
export async function startFixtureServer({ directory, port }) {
	if (await isPortListening(port)) {
		throw new Error(`Fixture port ${port} is already occupied; refusing foreign listener adoption.`);
	}
	const origin = `http://${HOST}:${port}`;
	const server = spawn('python3', [
		'-m', 'http.server', String(port), '--bind', HOST, '--directory', directory
	], { stdio: 'ignore' });
	try {
		await once(server, 'spawn');
		assertChildRunning(server, 'failed immediately after spawn');
		await waitForFixtureReady(origin, server);
		return { origin, server };
	} catch (error) {
		if (isChildRunning(server)) server.kill('SIGTERM');
		throw error;
	}
}
