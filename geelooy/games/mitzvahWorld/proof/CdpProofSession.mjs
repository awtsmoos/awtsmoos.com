//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CdpProofSession.mjs
 * @description Owns one finite Chrome DevTools witness for MitzvahWorld release proofs.
 * Target creation, websocket opening, commands, evidence routing, and cleanup are all bounded so diagnostics cannot hang forever.
 */

import { createCdpProofCommandChannel } from './CdpProofCommandChannel.mjs';
import {
	createCdpProofEvidence,
	recordCdpProofEvidence
} from './CdpProofEvidence.mjs';

const SESSION_TIMEOUT_MS = 12000;

/**
 * Creates one isolated DevTools page with bounded commands and browser-failure evidence.
 * @param {number} port Local Chrome remote-debugging port.
 * @returns {Promise<object>} Command API, target identity, evidence ledger, and close operation.
 */
export async function createCdpProofSession(port) {
	const target = await createTarget(port);
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await waitForSocketOpen(socket);
	const channel = createCdpProofCommandChannel(socket, {
		timeoutMs: SESSION_TIMEOUT_MS
	});
	const evidence = createCdpProofEvidence();
	socket.onmessage = event => {
		const message = JSON.parse(event.data);
		recordCdpProofEvidence(message, evidence);
		channel.resolve(message);
	};

	return {
		command: channel.command,
		evidence,
		networkErrors: evidence.networkErrors,
		target,
		async close() {
			channel.close();
			socket.close();
			await closeTarget(port, target.id);
		}
	};
}

/**
 * Creates one fresh about:blank page through Chrome's HTTP debugging endpoint.
 * @param {number} port Local Chrome remote-debugging port.
 * @returns {Promise<object>} Chrome target descriptor.
 */
async function createTarget(port) {
	const response = await fetch(
		`http://127.0.0.1:${port}/json/new?about%3Ablank`,
		{
			method: 'PUT',
			signal: AbortSignal.timeout(SESSION_TIMEOUT_MS)
		}
	);

	if (!response.ok) {
		throw new Error(`CDP_TARGET_CREATE_FAILED:${response.status}`);
	}

	return response.json();
}

/**
 * Waits for the DevTools websocket to open or fail within the release-proof deadline.
 * @param {WebSocket} socket Fresh target websocket.
 * @returns {Promise<void>} Resolves only when Chrome accepts the connection.
 */
function waitForSocketOpen(socket) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error('CDP_SOCKET_OPEN_TIMEOUT'));
		}, SESSION_TIMEOUT_MS);
		socket.onopen = () => {
			clearTimeout(timer);
			resolve();
		};
		socket.onerror = error => {
			clearTimeout(timer);
			reject(error);
		};
	});
}

/**
 * Closes one temporary DevTools page without letting browser cleanup stall the proof.
 * @param {number} port Local Chrome remote-debugging port.
 * @param {string} targetId Temporary target identifier.
 * @returns {Promise<void>} Resolves after close succeeds or the cleanup request is abandoned.
 */
async function closeTarget(port, targetId) {
	await fetch(
		`http://127.0.0.1:${port}/json/close/${targetId}`,
		{
			signal: AbortSignal.timeout(SESSION_TIMEOUT_MS)
		}
	).catch(() => null);
}
