// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	wakeTimers
} = Context.shared;
const schedule = Context.reference("schedule");
const clearWake = Context.reference("clearWake");

/**
 * @file Reveals the scheduleWake stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function scheduleWake(config, id, delayMs) {
	clearWake(id);
	const timer = setTimeout(() => {
		wakeTimers.delete(id);
		schedule(config, id);
	}, Math.max(250, Number(delayMs) || 3000));
	timer.unref?.();
	wakeTimers.set(id, timer);
}

Context.register("scheduleWake", scheduleWake);
module.exports = scheduleWake;
