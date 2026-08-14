// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Interprets parent commands without mistaking queue custody for settlement.
 * @description
 * The Awtsmoos renews one request through several vessels; Awtsmoos.com therefore
 * keeps the durable inbox after parent admission. Only the relay's terminal response
 * acknowledgement may erase that custody, so a green socket cannot hide lost work.
 */
function createChildMessageRouter(runtime, options = {}) {
	const exitProcess = options.exitProcess || (code => process.exit(code));

	function handle(message) {
		if (!Protocol.valid(message)) return false;
		if (message.type === Protocol.TYPES.PARENT_READY) {
			runtime.parentDidBecomeReady();
			return true;
		}
		if (message.type === Protocol.TYPES.ACK) return acknowledge(message);
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

	/**
	 * Records that the parent accepted queue custody without deleting disk evidence.
	 * @param {object} message Valid connection ACK carrying the request receipt ID.
	 * @returns {boolean} True only when the ACK names an actual request identity.
	 */
	function acknowledge(message) {
		const receiptId = Protocol.requestId(message);
		if (!receiptId) return false;
		runtime.noteParentCustody?.(receiptId);
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
