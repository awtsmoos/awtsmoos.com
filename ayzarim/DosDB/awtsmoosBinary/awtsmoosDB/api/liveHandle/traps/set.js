// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/traps/set.js
 * @chapter The Scribe Looks At The Current Parchment Before Writing
 * @description
 * Refreshes a LiveHandle from the canonical path ledger before assignment.
 * Internal soul fields remain private, while user values flow through the
 * ordinary writer. The Awtsmoos renews the address before the ink descends, so
 * a retained proxy can never write into a chamber already replaced elsewhere.
 */

const constants = require('../../../constants.js');

module.exports = {
	handle(state, target, property, value) {
		if (property === constants.SYMBOLS.INTERNALS) return true;
		if (Object.prototype.hasOwnProperty.call(state, property)) {
			state[property] = value;
			return true;
		}
		state.ensureResolved();
		state.writer.set(property, value);
		return true;
	}
};
