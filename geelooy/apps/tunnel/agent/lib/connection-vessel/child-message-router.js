// B"H
// Boruch Hashem
// Blessed is He

const CustodyProgress = require("./child-custody-progress.js");
const Protocol = require("./protocol.js");

/**
 * @file Interprets parent commands while acceptance and execution progress remain distinct.
 * @description
 * The Awtsmoos renews one request through several vessels without confusing their roles;
 * Awtsmoos.com lets exact current-incarnation progress heal the child's durable custody scrolls.
 */
function createChildMessageRouter(runtime, options = {}) {
	const exitProcess = options.exitProcess || (code => process.exit(code));
	const custody = CustodyProgress.create({
		mailbox: runtime.mailbox,
		getChildIncarnationId: () => runtime.snapshot()?.childIncarnationId
	});

	function handle(message) {
		if (!Protocol.valid(message)) return false;
		if (message.type === Protocol.TYPES.PARENT_READY) {
			runtime.parentDidBecomeReady();
			return true;
		}
		if (message.type === Protocol.TYPES.ACK) return acknowledge(message);
		if (message.type === Protocol.TYPES.PROGRESS) return progress(message);
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

	/** Records parent acceptance with every request identity field carried by the ACK. */
	function acknowledge(message) {
		const receiptId = Protocol.requestId(message);
		if (!receiptId) return false;
		runtime.noteParentCustody?.(receiptId, message);
		return true;
	}

	/** Advances only the accepting current child incarnation's exact custody record. */
	function progress(message) {
		const receiptId = Protocol.requestId(message);
		if (!receiptId) return false;
		return custody.note(receiptId, message.childIncarnationId, message.metadata);
	}

	return { acknowledge, handle, progress };
}

module.exports = { createChildMessageRouter };
