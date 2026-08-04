// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const loaderPath = Context.reference("loaderPath");

/**
 * @file Reveals the loadService stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function loadService(config = {}) {
	return require(loaderPath()).loadDirectService(config);
}

Context.register("loadService", loadService);
module.exports = loadService;
