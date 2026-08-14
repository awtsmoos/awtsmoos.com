// B"H

const Store = require("../toolReceipts/store.js");

/** Counts durable external testimony without opening the mission AWDB. */
function counts(config, missionId) {
	try {
		return Store.counts(config, missionId);
	} catch {
		return {};
	}
}

module.exports = { counts };
