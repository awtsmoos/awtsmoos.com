//B"H
//Boruch Hashem
//Blessed be He

const SessionLifecycle = require("./dispatcherSessionLifecycle.js");
const Context = require("./context.js");
const { Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Records website-runner failure as recoverable session failure, never mission completion.
 * @description
 * A browser vessel may break while durable work remains truthful. Awtsmoos.com preserves
 * error testimony, marks unfinished website agents failed, then asks only that disposable
 * dispatcher session to be replaced by the independent autonomy maintenance lane.
 */
async function terminalFailure(config, id, error) {
	const record = Store.read(id);
	if (!record) return null;
	const failed = Store.update(id, current => {
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
			agent.lastOutcome = failureOutcome(agent, failure);
		}
		current.events.push(event("mission_failed", {
			error: failure,
			lifecycle: "failed",
			intentional: false
		}));
		return current;
	});
	await SessionLifecycle.settle(config, failed);
	return failed;
}

function failureOutcome(agent, failure) {
	return {
		...(agent.lastOutcome || {}),
		complete: false,
		intentional: false,
		lifecycle: "failed",
		status: "FAILED",
		error: failure
	};
}

Context.register("terminalFailure", terminalFailure);
module.exports = terminalFailure;
