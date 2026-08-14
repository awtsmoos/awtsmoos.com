// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");

/** @file Proves durable duplicate and authenticated-orphan response settlement. */
const directory = __dirname;
const statePath = path.join(directory, "state.js");
const lifecyclePath = path.join(directory, "lifecycle.js");
const validationPath = path.join(directory, "validation.js");
const handlerPath = path.join(directory, "responseHandler.js");
const quarantine = [];
const persisted = [];
let hydrated = completed("request-one");
let responseValid = true;

require.cache[statePath] = {
	id: statePath,
	filename: statePath,
	loaded: true,
	exports: {
		cleanup() {},
		ensureStores(context) {
			context.pendingTunnelRequests ||= new Map();
		},
		hydrate: async () => hydrated,
		quarantine: (_context, entry) => quarantine.push(entry),
		rememberCompleted: async (_context, id, data, expected) => {
			const record = { ...completed(id), data, expected };
			persisted.push(record);
			return record;
		}
	}
};
require.cache[lifecyclePath] = {
	id: lifecyclePath,
	filename: lifecyclePath,
	loaded: true,
	exports: { finishPending: async () => ({ state: "completed" }) }
};
require.cache[validationPath] = {
	id: validationPath,
	filename: validationPath,
	loaded: true,
	exports: {
		validateTunnelResponse: () => responseValid
			? { ok: true }
			: { ok: false, response: { nonceMismatch: true } }
	}
};
delete require.cache[handlerPath];
const Handler = require(handlerPath);
const sent = [];
const client = {
	registrationKey: "acct::route",
	tunnelId: "route",
	send: message => sent.push(message)
};
const context = { pendingTunnelRequests: new Map() };

void run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

async function run() {
	respond("request-one", "receipt-one");
	await turn();
	assert.equal(sent.at(-1).transportReceiptId, "receipt-one");
	hydrated = null;
	respond("orphan-one", "orphan-receipt");
	await turn();
	assert.equal(persisted.at(-1).data.transportReceiptId, "orphan-receipt");
	assert.equal(sent.at(-1).transportReceiptId, "orphan-receipt");
	hydrated = pending("recovered-pending");
	respond("recovered-pending", "recovered-receipt");
	await turn();
	assert.equal(sent.at(-1).transportReceiptId, "recovered-receipt");
	responseValid = false;
	context.pendingTunnelRequests.set("mismatch", pending("mismatch"));
	const beforeMismatch = sent.length;
	assert.equal(respond("mismatch", "mismatched-receipt"), false);
	assert.equal(sent.length, beforeMismatch);
	assert.equal(quarantine.at(-1).reason, "correlation_mismatch");
	console.log(JSON.stringify({
		ok: true,
		suite: "response-ack-recovery",
		durableDuplicateAcknowledged: true,
		authenticatedOrphanPersistedThenAcknowledged: true,
		mismatchPreservedWithoutAcknowledgement: true
	}, null, 2));
}

function respond(id, transportReceiptId) {
	return Handler.handleTunnelResponse(context, client, {
		id,
		originRegistrationKey: client.registrationKey,
		transportReceiptId
	});
}

function completed(id) {
	return { state: "completed", expected: { id, registrationKey: "acct::route" } };
}

function pending(id) {
	return { state: "pending", expected: { id, registrationKey: "acct::route" } };
}

function turn() {
	return new Promise(resolve => setImmediate(resolve));
}
