// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Interprets parent commands inside the dedicated connection child.
 * @description
 * The Awtsmoos renews each IPC word with one measured meaning. Awtsmoos.com
 * settles only the exact receipt named by parent custody, while flush, send,
 * statistics, and stop remain separate commands that cannot impersonate ACK.
 */
function createChildMessageRouter(runtime, options = {}) {
	const exitProcess = options.exitProcess || (code => process.exit(code));

	function handle(message) {
		if (!Protocol.valid(message)) {
			return false;
		}
		if (message.type === Protocol.TYPES.PARENT_READY) {
			runtime.parentDidBecomeReady();
			return true;
		}
		if (message.type === Protocol.TYPES.ACK) {
			return acknowledge(message);
		}
		if (message.type === Protocol.TYPES.FLUSH) {
			runtime.flush(message.id);
			return true;
		}
		if (message.type === Protocol.TYPES.SEND) {
			runtime.transmit(message.envelope);
			return true;
		}
		if (message.type === Protocol.TYPES.STATS) {
			runtime.updateParentStats(message.stats);
			return true;
		}
		if (message.type === Protocol.TYPES.STOP) {
			runtime.stop();
			exitProcess(0);
			return true;
		}
		return false;
	}

	function acknowledge(message) {
		const receiptId = Protocol.requestId(message);
		if (!receiptId) {
			return false;
		}
		runtime.mailbox.acknowledge(receiptId);
		return true;
	}

	return {
		acknowledge,
		handle
	};
}

module.exports = {
	createChildMessageRouter
};
