// B"H
const assert = require("node:assert/strict");
const { createConnectionMessages } = require("../lib/runtime/main-connection-messages.js");

async function run() {
	let queued = 0;
	let calls = 0;
	const sent = [];
	const dependencies = {
		Control: { markSeen() {} },
		Correlation: { fields() { return {}; } },
		RecoveryControl: { handle() { return false; } },
		Replacement: { isReplacementMessage() { return false; } },
		Receipt: { markServerSeenAsync: async () => {} },
		Send: { safeSend(_socket, envelope) { sent.push(envelope); } },
		clearReconnect() {},
		enqueueRequest() { queued += 1; },
		handleCommand: async payload => {
			calls += 1;
			assert.equal(payload.sync, true);
			assert.equal(payload.inline, true);
			assert.equal(payload.noMission, true);
			assert.equal(payload.command, "printf BH_FAST");
			return { ok: true, action: "commandRun", stdout: "BH_FAST", exitCode: 0 };
		},
		log() {},
		state: { generation: 1 }
	};
	const messages = createConnectionMessages(dependencies);
	assert.equal(messages.handle(JSON.stringify({
		type: "TUNNEL_REQUEST",
		id: "fast-regression",
		payload: {
			action: "commandRun",
			command: "printf BH_FAST",
			async: false
		}
	}), {}), true);
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(queued, 0);
	assert.equal(calls, 1);
	assert.equal(sent.length, 1);
	assert.equal(sent[0].id, "fast-regression");
	assert.equal(sent[0].syncExec, true);
	assert.equal(sent[0].stdout, "BH_FAST");
	console.log('B"H sync tunnel fast-path regression passed');
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
