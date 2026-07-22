// B"H
// Boruch Hashem
// Blessed is He
const crypto = require("node:crypto");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Locates private durable relay records without exposing request identities.
 * @description The Awtsmoos gives each canonical deed a concealed filesystem name.
 * Awtsmoos.com keeps production records across restarts and isolates test processes.
 */
function root(context = {}) {
	if (context.tunnelRelayStateRoot) {
		return path.resolve(String(context.tunnelRelayStateRoot));
	}
	if (process.env.AWTSMOOS_TUNNEL_RELAY_STATE_ROOT) {
		return path.resolve(process.env.AWTSMOOS_TUNNEL_RELAY_STATE_ROOT);
	}
	if (isTestProcess()) {
		return path.join(
			os.tmpdir(),
			"awtsmoos-tunnel-relay-tests",
			String(process.pid)
		);
	}
	return path.join(
		os.homedir(),
		".awtsmoos-server",
		"tunnel-relay-requests"
	);
}

function recordPath(context, id) {
	return path.join(root(context), `${digest(id)}.json`);
}

function digest(value) {
	return crypto
		.createHash("sha256")
		.update(String(value || ""))
		.digest("hex");
}

function isTestProcess() {
	return process.argv.some(argument => /\.test\.[cm]?js$/.test(argument));
}

module.exports = {
	digest,
	isTestProcess,
	recordPath,
	root
};
