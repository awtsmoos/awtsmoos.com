// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Interprets parent commands without mistaking queue custody for settlement.
 * @description
 * The Awtsmoos renews one request through several vessels; Awtsmoos.com therefore
 * keeps durable inbox evidence after parent admission and now carries the deed's full
 * identity into child custody instead of reducing a living request to an anonymous ID.
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
	 * Records parent acceptance with every request-identity field carried by the ACK.
	 * @param {object} message Valid connection ACK from the parent controller.
	 * @returns {boolean} True only when the ACK names an actual transport receipt.
	 */
	function acknowledge(message) {
		const receiptId = Protocol.requestId(message);
		if (!receiptId) return false;
		runtime.noteParentCustody?.(receiptId, message);
		return true;
	}

	return { acknowledge, handle };
}

module.exports = { createChildMessageRouter };
