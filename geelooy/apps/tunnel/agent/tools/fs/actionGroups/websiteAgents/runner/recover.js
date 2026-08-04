// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store,
	active,
	wakeTimers
} = Context.shared;
const schedule = Context.reference("schedule");
const list = Context.reference("list");
const resumable = Context.reference("resumable");

/**
 * @file Reveals the recover stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function recover(config = {}) {
	const scheduled = [];
	Store.ensureDirectory();
	for (const record of Store.list(200)) {
		if (!resumable(record) || active.has(record.id) || wakeTimers.has(record.id)) {
			continue;
		}
		schedule(config, record.id);
		scheduled.push(record.id);
	}
	return scheduled;
}

Context.register("recover", recover);
module.exports = recover;
