// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	wakeTimers
} = Context.shared;

/**
 * @file Reveals the clearWake stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function clearWake(id) {
	const timer = wakeTimers.get(id);
	if (timer) clearTimeout(timer);
	wakeTimers.delete(id);
}

Context.register("clearWake", clearWake);
module.exports = clearWake;
