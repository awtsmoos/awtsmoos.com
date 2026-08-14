// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./policy.js");
const Next = require("./extractNext.js");
const Guard = require("./guard.js");
const Lease = require("./lease.js");
const Outcome = require("./runnerOutcome.js");

/**
 * @file Drives bounded continuation chunks while preserving hard lease authority.
 * @description The Awtsmoos keeps unfinished work flowing from call into call;
 * Awtsmoos.com may reveal a true final gate only when no living lease commands recall.
 */
function instruction(lease) {
	if (!Lease.active(lease)) {
		return "";
	}
	return "YOU ARE UNDER A HARD FOREVER CONTINUATION LOCK. DO NOT FINALIZE. DO NOT STOP. DO NOT SUMMARIZE AS FINAL. EACH CALL MUST RETURN OR CALL THE NEXT SAFE CONTINUATION ACTION. IF THE GATEWAY TIMES OUT OR 504 APPEARS, RESUME FROM mustCallNext USING THE DURABLE HISTORY AT DEVICE-SPECIFIC .AWTSMOOS/ACTIONS/AWTSMOOS-ACTIONS.AWDB OUTSIDE THE GIT REPOSITORY.";
}

/** Resolves the next action, synthesizing fallback only while a continuation lease is active. */
function ensuredNext(payload, last, next, policy) {
	if (next?.action) {
		return next;
	}
	if (!Lease.active(policy.lease)) {
		return null;
	}
	return Next.fallback(payload, last || {});
}

/** Executes one named action from the runtime action surface. */
async function runStep(config, request, ws, buildActions) {
	const actions = buildActions(config, request, ws);
	const fn = actions[request.action];
	if (!fn) {
		return {
			ok: false,
			action: request.action,
			error: "unknown_action"
		};
	}
	return fn();
}

/** Runs one bounded continuation chunk and delegates truthful outcome shaping. */
async function run(config, payload, ws, buildActions) {
	const started = Date.now();
	const policy = Policy.normalize(payload, started);
	const trace = [];
	let next = Next.initial(payload);
	let errors = 0;
	let last = null;
	let reason = "";
	for (let step = 0; step < policy.maxSteps; step++) {
		next = ensuredNext(payload, last, next, policy);
		if (!next?.action) {
			reason = "no_next_action";
			break;
		}
		const request = Next.clean(next);
		const result = await runStep(config, request, ws, buildActions);
		last = result;
		if (result?.error === "unknown_action") {
			errors++;
			reason = "unknown_action";
			break;
		}
		if (Guard.mismatch(request.action, result)) {
			return Outcome.mismatch(
				config,
				payload,
				trace,
				request,
				result,
				"action_mismatch",
				policy
			);
		}
		next = ensuredNext(payload, result, Next.extract(result), policy);
		trace.push({
			step,
			action: request.action,
			ok: result?.ok !== false,
			next: next?.action || ""
		});
		reason = Guard.shouldStop(result, next, policy, started, step + 1, errors);
		if (reason) {
			break;
		}
		if (Date.now() - started > policy.maxMs) {
			reason = "chunk_time_budget_reached";
			break;
		}
	}
	next = ensuredNext(payload, last, next, policy);
	return Outcome.complete({
		config,
		payload,
		reason,
		trace,
		next,
		last,
		started,
		policy,
		tunnelInstruction: instruction(policy.lease)
	});
}

module.exports = {
	ensuredNext,
	instruction,
	run
};
