// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Routes parent IPC testimony into the connection child runtime.
 * @description
 * The Awtsmoos distinguishes acceptance from refusal and execution; Awtsmoos.com routes
 * each testimony through its own sealed message so one rejected deed can retire in peace.
 */
function createChildMessageRouter(runtime, options = {}) {
	const exitProcess = options.exitProcess || process.exit;

	function handle(message) {
		if (!Protocol.valid(message)) return false;
		if (message.type === Protocol.TYPES.PARENT_READY) {
			runtime.parentDidBecomeReady?.();
			return true;
		}
		if (message.type === Protocol.TYPES.ACK) return acknowledge(message);
		if (message.type === Protocol.TYPES.CUSTODY_PROGRESS) return progress(message);
		if (message.type === Protocol.TYPES.REJECT) return reject(message);
		if (message.type === Protocol.TYPES.FLUSH) {
			runtime.flush?.();
			return true;
		}
		if (message.type === Protocol.TYPES.SEND) {
			runtime.transmit?.(message.payload);
			return true;
		}
		if (message.type === Protocol.TYPES.STATS) {
			runtime.updateParentStats?.(message.stats);
			return true;
		}
		if (message.type === Protocol.TYPES.STOP) {
			runtime.stop?.();
			exitProcess(Number(message.exitCode || 0));
			return true;
		}
		return false;
	}

	function acknowledge(message) {
		const receiptId = Protocol.requestId(message);
		if (!receiptId) return false;
		runtime.noteParentCustody?.(receiptId, message);
		return true;
	}

	function progress(message) {
		const receiptId = Protocol.requestId(message);
		if (!receiptId) return false;
		return Boolean(runtime.noteCustodyProgress?.(receiptId, message));
	}

	function reject(message) {
		const receiptId = Protocol.requestId(message);
		if (!receiptId) return false;
		return Boolean(runtime.rejectRequest?.(receiptId, message));
	}

	return { acknowledge, handle, progress, reject };
}

module.exports = { createChildMessageRouter };
