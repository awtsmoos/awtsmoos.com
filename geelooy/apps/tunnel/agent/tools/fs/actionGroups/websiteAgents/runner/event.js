// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");

/**
 * @file Reveals the event stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function event(type, details = {}) {
	return { at: new Date().toISOString(), type, ...details };
}

Context.register("event", event);
module.exports = event;
