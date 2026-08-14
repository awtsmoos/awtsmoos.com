// B"H

const Lock = require("../lock/index.js");
const Classify = require("./classify.js");
const Store = require("./store.js");

/**
 * @file Persists tool testimony outside the contested mission AWDB.
 * @description A completed filesystem deed must not become a false failure because
 * an unrelated history sequence is busy or damaged. Storage failures still throw.
 */
function attach(config, payload = {}, result = {}) {
	const lock = Lock.active(config);
	if (!lock) return null;
	const receipt = {
		missionId: lock.missionId,
		...Classify.summary(payload, result)
	};
	Store.append(config, receipt);
	return receipt;
}

module.exports = { attach };
