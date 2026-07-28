//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { RequestOnlyProbeSequence } from "../relay/direct/chatgpt/RequestOnlyProbeSequence.mjs";

/** Official probes execute sequentially with a gap between each endpoint family. */
test("request-only probes are paced and ordered", async () => {
	const events = [];
	const sequence = new RequestOnlyProbeSequence({
		gapMs: 2000,
		sleep: async milliseconds => events.push(["sleep", milliseconds])
	});
	const ledger = {
		async measure(name, callback) {
			events.push(["start", name]);
			const result = await callback();
			events.push(["finish", name]);
			return result;
		}
	};
	const factory = name => () => ({
		async prepare() {
			events.push(["probe", name]);
			return { name };
		},
		async createToken() {
			events.push(["probe", name]);
			return { name };
		}
	});
	const result = await sequence.run({
		host: { cdpClient: {}, applicationHeaders: {} },
		ledger,
		prepareFactory: factory("conversation"),
		sentinelPrepareFactory: factory("sentinel"),
		sentinelSdkFactory: factory("sdk")
	});
	assert.deepEqual(
		events.filter(([kind]) => kind === "probe" || kind === "sleep"),
		[
			["probe", "conversation"],
			["sleep", 2000],
			["probe", "sentinel"],
			["sleep", 2000],
			["probe", "sdk"]
		]
	);
	assert.equal(result.conversationPrepare.name, "conversation");
	assert.equal(result.sentinelPrepare.name, "sentinel");
	assert.equal(result.sentinelSdk.name, "sdk");
});
