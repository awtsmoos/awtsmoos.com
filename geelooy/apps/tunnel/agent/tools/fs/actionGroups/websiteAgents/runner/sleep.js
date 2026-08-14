// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");

/**
 * @file Reveals the sleep stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function sleep(config, milliseconds) {
	if (typeof config.websiteMissionSleep === "function") {
		return config.websiteMissionSleep(milliseconds);
	}
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

Context.register("sleep", sleep);
module.exports = sleep;
