// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const State = require("./state.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-relay-order-"));
const context = { tunnelRelayStateRoot: root };
const id = "request-acceptance-order";
const expected = {
	id,
	registrationKey: "account::tunnel",
	requestedAction: "stat"
};

(async () => {
	const claim = await State.claim(context, id, expected);
	assert.equal(claim.created, true);
	const accepted = State.rememberAccepted(context, id, expected, {
		acceptedAt: new Date().toISOString(),
		registrationGeneration: 2
	});
	const terminal = State.rememberCompleted(context, id, {
		type: "TUNNEL_RESPONSE",
		id,
		ok: true
	}, expected);
	await Promise.all([accepted, terminal]);
	const recovered = await State.hydrate(context, id, expected);
	assert.equal(recovered.state, "completed");
	assert.equal(recovered.data.ok, true);
	const lateAcceptance = await State.rememberAccepted(context, id, expected, {
		registrationGeneration: 3
	});
	assert.equal(lateAcceptance.state, "completed");
	console.log(JSON.stringify({
		ok: true,
		suite: "durable-acceptance-ordering",
		acceptanceCannotOverwriteTerminal: true,
		lateAcceptanceIsIdempotent: true
	}));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
}).finally(() => {
	fs.rmSync(root, { recursive: true, force: true });
});
