// B"H

const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");

const SECRET_KINDS = Object.freeze([
	"credential",
	"private-key",
	"pairing-request-secret"
]);

/** Deletes every local device secret and its nonsecret binding metadata. */
function forget(config = {}) {
	const metadata = Metadata.read(config);
	if (!metadata?.deviceId) {
		return { ok: true, removed: false, state: "unpaired" };
	}
	for (const kind of SECRET_KINDS) {
		SecureStore.remove(metadata.deviceId, kind);
	}
	Metadata.remove(config);
	return {
		ok: true,
		removed: true,
		state: "unpaired",
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId || null
	};
}

module.exports = { SECRET_KINDS, forget };
