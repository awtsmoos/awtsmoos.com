// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");

/**
 * @file Reveals the failure stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function failure(error, extra = {}) {
	return { ok: false, action: "websiteAgentMission", error, ...extra };
}

Context.register("failure", failure);
module.exports = failure;
