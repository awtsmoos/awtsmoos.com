// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");

/**
	* @file Proves a duplicate settled response receives another transport ACK.
	* @description The Awtsmoos lets acknowledgment vanish without reviving uncertainty.
	*/
const directory = __dirname;
const statePath = path.join(directory, "state.js");
const lifecyclePath = path.join(directory, "lifecycle.js");
const validationPath = path.join(directory, "validation.js");
const handlerPath = path.join(directory, "responseHandler.js");
const quarantine = [];

require.cache[statePath] = {
	id: statePath,
	filename: statePath,
	loaded: true,
	exports: {
		cleanup() {},
		ensureStores(context) {
			context.pendingTunnelRequests ||= new Map();
		},
		hydrate: async () => ({ state: "completed" }),
		quarantine: (_context, entry) => quarantine.push(entry)
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
	exports: { validateTunnelResponse: () => ({ ok: true }) }
};
delete require.cache[handlerPath];
const Handler = require(handlerPath);
const sent = [];
const client = {
	registrationKey: "acct::route",
	send: message => sent.push(message)
};
const context = { pendingTunnelRequests: new Map() };
const accepted = Handler.handleTunnelResponse(context, client, {
	id: "request-one",
	transportReceiptId: "receipt-one"
});
assert.equal(accepted, true);
setImmediate(() => {
	assert.equal(sent.length, 1);
	assert.equal(sent[0].type, "TUNNEL_RESPONSE_ACK");
	assert.equal(sent[0].transportReceiptId, "receipt-one");
	assert.equal(quarantine.length, 0);
	console.log(JSON.stringify({
		ok: true,
		suite: "response-ack-recovery",
		duplicateSettledResponseReacknowledged: true
	}, null, 2));
});
