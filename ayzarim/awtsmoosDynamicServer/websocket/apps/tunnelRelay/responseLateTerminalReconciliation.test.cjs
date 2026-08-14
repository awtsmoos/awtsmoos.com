// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Handler = require("./responseHandler.js");
const State = require("./state.js");

/** @file Proves an old missing-stream response is persisted before transport ACK. */
void run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

async function run() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-late-response-"));
	try {
		const context = {
			pendingTunnelRequests: new Map(),
			tunnelRelayStateRoot: root
		};
		const id = "historical-stream-response";
		const registrationKey = "4:test:tun_test";
		const expected = {
			id,
			jobId: "cmdjob-old",
			projectRoot: "/project",
			registrationKey,
			requestedAction: "commandJobOutputPage",
			stream: "stdout",
			tunnelName: "awt-test"
		};
		await State.rememberExpired(context, id, { error: "relay_expired" }, expected);
		const record = await State.hydrate(context, id, expected);
		const sent = [];
		const response = {
			action: "commandJobOutputPage",
			id,
			jobId: expected.jobId,
			originRegistrationKey: registrationKey,
			projectRoot: expected.projectRoot,
			transportReceiptId: id,
			tunnelName: expected.tunnelName
		};
		const settled = await Handler.settleHydrated(
			context,
			{ registrationKey, tunnelId: "tun_test", send: value => sent.push(value) },
			response,
			id,
			record,
			{ registrationKey }
		);
		assert.equal(settled, true);
		assert.equal(sent[0].transportReceiptId, id);
		const durable = await State.hydrate(context, id, expected);
		assert.equal(durable.state, "expired");
		assert.equal(durable.reconciliation.data.jobId, expected.jobId);
		console.log(JSON.stringify({
			ok: true,
			suite: "response-late-terminal-reconciliation",
			persistedBeforeAcknowledgement: true
		}));
	} finally {
		fs.rmSync(root, { force: true, recursive: true });
	}
}
