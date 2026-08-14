// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;

/**
 * @file Reveals the list stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function list(input = {}) {
	return {
		ok: true,
		action: "websiteAgentMissionList",
		missions: Store.list(input.limit).map(Store.publicRecord)
	};
}

Context.register("list", list);
module.exports = list;
