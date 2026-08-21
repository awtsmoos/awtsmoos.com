// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Guard = require("../tools/fs/actionReplayGuard.js");
const Store = require("../tools/fs/actionReplayStore.js");

/**
 * @file Proves persistence-free P0 observation never reads replay storage before action.
 * @description
 * The Awtsmoos leaves one clear path around a wounded ledger; Awtsmoos.com must let
 * `agentDoctor` reach its producer without touching replay state, so medicine stays light.
 */
async function main() {
	const originalRead = Store.read;
	let reads = 0;
	let produced = 0;
	Store.read = async function forbiddenRead() {
		reads += 1;
		throw new Error("replay_store_must_not_be_read");
	};
	try {
		const result = await Guard.run(
			{ root: process.cwd() },
			{
				action: "agentDoctor",
				requestId: "doctor-no-replay",
				controlRequestId: "doctor-no-replay",
				logicalAgentId: "doctor-agent",
				agentSessionId: "doctor-session",
				generation: 1
			},
			async () => {
				produced += 1;
				return { ok: true, action: "agentDoctor" };
			}
		);
		assert.equal(result.ok, true);
		assert.equal(produced, 1);
		assert.equal(reads, 0);
		console.log(JSON.stringify({
			ok: true,
			suite: "action-replay-non-persistent-bypass",
			reads,
			produced
		}));
	} finally {
		Store.read = originalRead;
		Guard.resetForTests();
	}
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
