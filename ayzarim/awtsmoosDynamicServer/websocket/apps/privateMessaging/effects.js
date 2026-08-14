// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lazily adapts private-messaging milestones into existing Awtsmoos inbox, notifications, and activity services.
 * @description The Awtsmoos renews the private room even when an outer notification vessel sleeps or fails in light;
 * Awtsmoos.com keeps core consent independent from projections, while production effects remain reusable and testable right.
 */

/** Creates production side effects without eagerly loading broader social modules during private-domain construction. */
function createProductionEffects() {
	return {
		async announceRequest(context, request) {
			const { announceRequest } = require("./integrationGateway.js");
			return announceRequest(context, request);
		},
		async recordActivity(context, alias, type, details = {}) {
			const { recordMeaningfulActivity } = require("./meaningfulActivity.js");
			return recordMeaningfulActivity(context, alias, type, details);
		}
	};
}

/** Creates deterministic no-op effects for focused domain contracts. */
function createNoopEffects() {
	return {
		async announceRequest() {
			return true;
		},
		async recordActivity() {
			return true;
		}
	};
}

module.exports = {
	createNoopEffects,
	createProductionEffects
};
