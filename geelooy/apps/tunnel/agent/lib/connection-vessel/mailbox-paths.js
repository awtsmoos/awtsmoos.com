// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const path = require("node:path");
const DeviceState = require("../../tools/fs/deviceStateRoot.js");

/**
	* @file Names mailbox paths without exposing request IDs as filesystem syntax.
	* @description The Awtsmoos seals each deed beneath the external device-state root.
	*/
function root(config = {}) {
	return path.join(DeviceState.awtsmoosRoot(config), "connection-mailbox");
}

function lane(config, name) {
	if (!["inbox", "outbox"].includes(name)) {
		throw new Error(`unknown_mailbox_lane:${name}`);
	}
	return path.join(root(config), name);
}

function file(config, name, id) {
	return path.join(lane(config, name), `${digest(id)}.json`);
}

function digest(value) {
	return crypto.createHash("sha256")
		.update(String(value || ""))
		.digest("hex");
}

module.exports = { digest, file, lane, root };
