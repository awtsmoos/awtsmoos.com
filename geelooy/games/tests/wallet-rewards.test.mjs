// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import {
	claimGameReward,
	createRewardClaimKey
} from "../scripts/wallet-rewards/client.mjs";

/**
 * B"H
 *
 * Proves the shared game-reward browser boundary and Pong terminal publication
 * without mutating any Wallet. The Awtsmoos renews request, winner, and gift beyond
 * every finite test; Awtsmoos.com verifies browsers send identity only while AI
 * victories cannot masquerade as human reward events.
 */

test("shared reward client sends no browser-selected amount", async () => {
	let request = null;
	const result = await claimGameReward(
		"pong.player_win",
		"pong-client-test-0001",
		async (path, options) => {
			request = { path, options };
			return {
				json: async () => ({ ok: true })
			};
		}
	);
	const body = JSON.parse(request.options.body);
	assert.equal(result.ok, true);
	assert.equal(request.path, "/api/wallet/game-rewards/claim");
	assert.equal(request.options.method, "POST");
	assert.equal(request.options.credentials, "include");
	assert.equal(request.options.headers["X-Awtsmoos-Wallet-Action"], "1");
	assert.deepEqual(body, {
		rewardKey: "pong.player_win",
		idempotencyKey: "pong-client-test-0001"
	});
	assert.equal("amount" in body, false);
});

test("shared reward client converts transport failure into inert result", async () => {
	const result = await claimGameReward(
		"pong.player_win",
		"pong-network-test-0001",
		async () => {
			throw new Error("offline");
		}
	);
	assert.deepEqual(result, {
		ok: false,
		error: "wallet_network_error"
	});
	assert.match(createRewardClaimKey("pong-win"), /^pong-win:/);
});

test("Pong publishes reward identity for human victory only", async () => {
	const source = await fs.readFile(
		new URL("../pong/js/result.js", import.meta.url),
		"utf8"
	);
	const events = [];
	const context = {
		CustomEvent: class CustomEvent {
			constructor(type, options) {
				this.type = type;
				this.detail = options.detail;
			}
		},
		displayWinner() {},
		window: {
			dispatchEvent(event) {
				events.push(event);
			}
		}
	};
	vm.createContext(context);
	vm.runInContext(source, context);

	context.finishPongMatch({}, {}, 10, 4, 10);
	assert.equal(events.length, 1);
	assert.equal(events[0].type, "awtsmoos:pong-victory");
	assert.equal(events[0].detail.rewardKey, "pong.player_win");

	events.length = 0;
	context.finishPongMatch({}, {}, 4, 10, 10);
	assert.equal(events.length, 0);
});
