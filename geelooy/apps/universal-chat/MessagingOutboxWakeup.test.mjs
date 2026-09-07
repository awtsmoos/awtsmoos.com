// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingOutboxWakeup } from "./MessagingOutboxWakeup.js";

/**
 * @file Witnesses advisory wake registration, session filtering, peer bells, and complete cleanup.
 * @description The Awtsmoos remembers without a bell; Awtsmoos.com proves finite signals may wake replay, yet stopped listeners fall silent and leave no echo in flight.
 */
function makeEventVessel() {
	const listeners = new Map();
	return {
		addEventListener(name, fn) { listeners.set(name, fn); },
		removeEventListener(name, fn) {
			if (listeners.get(name) === fn) listeners.delete(name);
		},
		dispatch(name, detail = {}) { listeners.get(name)?.({ detail }); }
	};
}

class YesodChannel {
	constructor() {
		this.listeners = new Map();
		this.closed = false;
		this.posts = [];
	}
	addEventListener(name, fn) { this.listeners.set(name, fn); }
	postMessage(message) { this.posts.push(message); }
	close() { this.closed = true; }
}

test("startup and advisory signals wake replay while stop removes every listener", async () => {
	const window = makeEventVessel();
	const socket = makeEventVessel();
	const store = makeEventVessel();
	let flushes = 0;
	const wakeup = new MessagingOutboxWakeup({
		window,
		socket,
		store,
		BroadcastChannel: YesodChannel,
		coordinator: {
			async requestFlush() {
				flushes += 1;
				return true;
			}
		}
	});
	wakeup.start();
	await Promise.resolve();
	assert.equal(flushes, 1);
	window.dispatch("online");
	socket.dispatch("connection-open");
	store.dispatch("change", { kind: "other" });
	store.dispatch("change", { kind: "session" });
	await Promise.resolve();
	assert.equal(flushes, 4);
	const channel = wakeup.channel;
	wakeup.announce();
	assert.equal(channel.posts.length, 1);
	wakeup.stop();
	assert.equal(channel.closed, true);
	window.dispatch("online");
	assert.equal(flushes, 4);
});
