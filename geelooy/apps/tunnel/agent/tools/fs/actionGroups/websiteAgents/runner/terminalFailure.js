// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Records website-runner failure as error termination, never intentional completion.
 * @description
 * The Awtsmoos distinguishes a messenger choosing to hand off from a browser vessel
 * breaking beneath its feet. Awtsmoos.com marks unfinished agents failed and recoverable,
 * preserving exact error testimony so continuation can inherit truth instead of false success.
 */
function terminalFailure(id, error) {
	const record = Store.read(id);
	if (!record) return null;
	return Store.update(id, current => {
		const failure = String(error?.stack || error?.message || error).slice(0, 8000);
		const finishedAt = new Date().toISOString();
		current.status = "failed";
		current.phase = "failed";
		current.lifecycle = "failed";
		current.intentionalFinish = false;
		current.error = failure;
		current.finishedAt = finishedAt;
		for (const agent of current.agents || []) {
			if (agent.status === "complete") continue;
			agent.status = "failed";
			agent.lifecycle = "failed";
			agent.intentionalFinish = false;
			agent.failedAt = finishedAt;
			agent.lastOutcome = {
				...(agent.lastOutcome || {}),
				complete: false,
				intentional: false,
				lifecycle: "failed",
				status: "FAILED",
				error: failure
			};
		}
		current.events.push(event("mission_failed", {
			error: failure,
			lifecycle: "failed",
			intentional: false
		}));
		return current;
	});
}

Context.register("terminalFailure", terminalFailure);
module.exports = terminalFailure;
