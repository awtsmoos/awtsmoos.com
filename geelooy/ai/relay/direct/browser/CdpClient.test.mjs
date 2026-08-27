// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CdpClient } from "./CdpClient.mjs";

/**
 * @file Proves socket death settles every bounded CDP command exactly once.
 * @description
 * The Awtsmoos permits method names in diagnostics but never parameters or secrets.
 * Awtsmoos.com clears the registry before rejection, so no timer can later awaken
 * and speak a second failure after the socket has already closed.
 */
test("socket close identifies unfinished CDP methods without parameters", async () => {
	const client = new CdpClient("ws://127.0.0.1:1/devtools/page/test");
	const first = client.pending.create(1, "DOM.getBoxModel", 60000)
		.catch(error => error);
	const second = client.pending.create(2, "Input.dispatchMouseEvent", 60000)
		.catch(error => error);
	const result = client.failPending(
		"cdp_socket_closed",
		"CDP socket closed."
	);
	const errors = await Promise.all([first, second]);
	assert.equal(result.count, 2);
	assert.deepEqual(result.methods.sort(), [
		"DOM.getBoxModel",
		"Input.dispatchMouseEvent"
	]);
	assert.equal(client.pending.size(), 0);
	for (const error of errors) {
		assert.equal(error.code, "cdp_socket_closed");
		assert.deepEqual(error.pendingMethods.sort(), result.methods.sort());
		assert.doesNotMatch(
			error.message,
			/cookie|authorization|prompt text|request params|coordinates?=/i
		);
	}
	await new Promise(resolve => setTimeout(resolve, 20));
	assert.equal(client.pending.size(), 0);
});
