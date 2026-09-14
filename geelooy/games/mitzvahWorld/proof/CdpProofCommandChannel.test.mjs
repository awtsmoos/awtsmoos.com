//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CdpProofCommandChannel.test.mjs
 * @description Proves real-release CDP commands cannot hang forever and still resolve exact request identities.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCdpProofCommandChannel } from './CdpProofCommandChannel.mjs';

/** Minimal websocket vessel that records outbound protocol messages without browser side effects. */
class ProofSocket {
	constructor() {
		this.sent = [];
	}

	/** Records one serialized DevTools command for deterministic response simulation. */
	send(message) {
		this.sent.push(JSON.parse(message));
	}
}

test('command resolves only its matching protocol response', async () => {
	const socket = new ProofSocket();
	const channel = createCdpProofCommandChannel(socket, {
		timeoutMs: 100
	});
	const pending = channel.command('Page.enable');
	const request = socket.sent[0];
	assert.equal(request.method, 'Page.enable');
	assert.equal(channel.resolve({
		id: request.id,
		result: {
			accepted: true
		}
	}), true);
	assert.deepEqual(await pending, {
		accepted: true
	});
	channel.close();
});

test('command rejects when Chrome never answers', async () => {
	const socket = new ProofSocket();
	const channel = createCdpProofCommandChannel(socket, {
		timeoutMs: 20
	});

	await assert.rejects(
		channel.command('Network.clearBrowserCache'),
		/CDP_TIMEOUT:Network\.clearBrowserCache/
	);
	channel.close();
});

test('closing the channel rejects every outstanding command', async () => {
	const socket = new ProofSocket();
	const channel = createCdpProofCommandChannel(socket, {
		timeoutMs: 1000
	});
	const pending = channel.command('Runtime.evaluate', {
		expression: '1 + 1'
	});

	channel.close('CDP_PROOF_FINISHED');
	await assert.rejects(
		pending,
		/CDP_PROOF_FINISHED/
	);
});
