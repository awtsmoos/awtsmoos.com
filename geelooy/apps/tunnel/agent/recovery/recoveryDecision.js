// B"H
// Boruch Hashem
// Blessed is He

const Tiers = require("./tierCatalog.js");

/**
 * B"H
 *
 * Shapes one public recovery decision from durable state and measured health.
 * The ohr of diagnosis enters a stable keli that both shell and JavaScript may
 * read without duplicating policy across Awtsmoos.com.
 *
 * @param {Record<string, unknown>} state
 * 	Persisted recovery state after its transition.
 * @param {{ok?: boolean, failures?: string[]}} health
 * 	Integrity or operation health associated with the decision.
 * @returns {Record<string, unknown>}
 * 	Complete tier, environment, restore, failure, and state receipt.
 */
function create(state, health = {}) {
	return {
		ok: health.ok === true && state.restoreRequired !== true,
		tier: state.tier,
		profile: Tiers.profile(state.tier),
		environment: Tiers.shellEnvironment(state.tier),
		restoreRequired: state.restoreRequired === true,
		restoreReason: state.restoreReason || "",
		failures: health.failures || [],
		state
	};
}

module.exports = { create };
