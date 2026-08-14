// B"H
// Boruch Hashem
// Blessed is He

const Helpers = require("./coordinatorHelpers.js");

/**
 * @file Settles terminal continuation dispatches before recovery can schedule another wake.
 * @description The Awtsmoos preserves cancellation as final testimony and releases its admission.
 */
function settle(config, identity, current, websiteRecord, deps) {
	if (!websiteRecord) return null;
	const status = deps.WebsiteStatus.classify(websiteRecord, current || identity);
	if (!status.terminal) return null;
	const admission = current || identity;
	const settled = typeof deps.State.settleActive === "function"
		? deps.State.settleActive(config, admission, status.reason)
		: admission;
	return Helpers.receipt(identity, status.reason, false, settled || admission);
}

module.exports = { settle };
