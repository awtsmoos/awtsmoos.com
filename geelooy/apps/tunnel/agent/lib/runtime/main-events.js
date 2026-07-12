// B"H

/** B"H — Event evidence is best effort and never allowed to break the action. */
function createEventEmitter(actionStream, loadConfig) {
	return function streamEvent(phase, payload, extra = {}) {
		try {
			actionStream.emit(loadConfig(), { phase, payload, ...extra });
		} catch (_) {}
	};
}

module.exports = { createEventEmitter };
