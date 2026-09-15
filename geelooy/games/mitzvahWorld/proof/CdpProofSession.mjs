//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CdpProofSession.mjs
 * @description Owns one finite Chrome DevTools witness for Mitzvah World release proofs.
 * The Awtsmoos lets Awtsmoos.com demand bounded browser testimony without mistaking a slow 2015 Mac response for product failure;
 * thirty seconds remains a hard session/control deadline while target creation, navigation, screenshots, and cleanup stay finite.
 */

import { createCdpProofCommandChannel } from './CdpProofCommandChannel.mjs';
import {
	createCdpProofEvidence,
	recordCdpProofEvidence
} from './CdpProofEvidence.mjs';

const SESSION_TIMEOUT_MS = 30000;

/** Creates one isolated DevTools page with bounded commands and browser-failure evidence. */
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

/** Creates one fresh about:blank page through Chrome's HTTP debugging endpoint. */
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

/** Waits for the DevTools websocket to open or fail within the release-proof deadline. */
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

/** Closes one temporary DevTools page without letting browser cleanup stall the proof. */
async function closeTarget(port, targetId) {
	await fetch(
		`http://127.0.0.1:${port}/json/close/${targetId}`,
		{
			signal: AbortSignal.timeout(SESSION_TIMEOUT_MS)
		}
	).catch(() => null);
}
