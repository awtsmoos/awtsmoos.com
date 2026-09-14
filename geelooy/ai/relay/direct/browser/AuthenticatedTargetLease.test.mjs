// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AuthenticatedSocketController } from "./AuthenticatedSocketController.mjs";
import { AuthenticatedTargetLifecycle } from "./AuthenticatedTargetLifecycle.mjs";

/**
 * @file Proves an active Direct target is leased before CDP and released after closure.
 * @description
 * The Awtsmoos gives navigation a protected vessel before a watchdog can race it.
 * Awtsmoos.com keeps that lease through intentional owned close and releases borrowed
 * targets only after their socket has detached.
 */
test("socket protects acquired target before CDP connect and navigation", async () => {
	const calls = [];
	const lifecycle = {
		protect: id => calls.push(`protect:${id}`),
		activate: async id => calls.push(`activate:${id}`),
		waitUntilReady: async () => ({ authenticated: true, composerVisible: true }),
		close: async () => ({ closed: true, verified: true })
	};
	const client = {
		connect: async () => calls.push("connect"),
		close() {}
	};
	const controller = new AuthenticatedSocketController({
		targetSelector: { acquire: async () => ({
			target: { id: "TURN", webSocketDebuggerUrl: "ws://turn" },
			owned: true,
			source: "fresh"
		}) },
		clientFactory: () => client,
		inspectorFactory: () => ({}),
		lifecycle,
		navigation: {
			ensure: async () => {
				calls.push("navigate");
				return { verified: true };
			}
		}
	});
	await controller.open();
	assert.deepEqual(calls.slice(0, 4), [
		"protect:TURN",
		"connect",
		"activate:TURN",
		"navigate"
	]);
});

test("owned close keeps lease until verified forced close", async () => {
	const calls = [];
	const activeLease = {
		protect() { return true; },
		release(id) { calls.push(`release:${id}`); }
	};
	const lifecycle = new AuthenticatedTargetLifecycle({
		port: 9224,
		activeLease,
		closer: {
			async close(id, options) {
				calls.push(`closer:${id}:${options.force}:${options.reason}`);
				return { closed: true, verified: true, attempts: 1 };
			}
		}
	});
	const cdpClient = {
		async send(method) { calls.push(`cdp:${method}`); },
		close() { calls.push("socket:close"); }
	};
	const result = await lifecycle.close({ targetId: "TURN", cdpClient, owned: true });
	assert.equal(result.verified, true);
	assert.deepEqual(calls, [
		"cdp:Target.closeTarget",
		"socket:close",
		"closer:TURN:true:owned_active_turn_close",
		"release:TURN"
	]);
});

test("borrowed target releases lease only after socket detaches", async () => {
	const calls = [];
	const lifecycle = new AuthenticatedTargetLifecycle({
		port: 9224,
		activeLease: {
			protect() { return true; },
			release(id) { calls.push(`release:${id}`); }
		}
	});
	const result = await lifecycle.close({
		targetId: "BORROWED",
		owned: false,
		cdpClient: { close() { calls.push("socket:close"); } }
	});
	assert.equal(result.detachedOnly, true);
	assert.deepEqual(calls, ["socket:close", "release:BORROWED"]);
});
