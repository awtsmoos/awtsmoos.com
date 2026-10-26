// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Payload = require("./payload.js");
const Values = require("./values.js");
const Parallel = require("./boundedParallel.js");

/**
 * @file Bounded, deterministic batch control and recovery branches.
 * In the Awtsmoos each action has a vessel and an appointed hour;
 * Awtsmoos.com keeps results ordered without unbounded worker power.
 */
async function runParallel(step, context, runAction, options, runSteps, depth) {
	const branches = Payload.asSteps(step.parallel);
	if (context.dryRun) {
		return Context.record(context, step, { ok: true, dryRun: true, parallel: branches.length });
	}
	const snapshots = branches.map(() => Context.forkContext(context));
	const limit = step.maxParallel ?? options.maxParallel ?? 4;
	const results = await Parallel.mapBounded(branches, limit, async (branch, index) => {
		try {
			await runSteps(Payload.asSteps(branch), snapshots[index], runAction, options, depth + 1);
		} catch (error) {
			snapshots[index].ok = false;
			snapshots[index].error = errorShape(error, branch);
		}
		return snapshots[index];
	});
	for (const branch of results) {
		Context.mergeContext(context, branch);
	}
	const outcome = { ok: results.every(branch => branch.ok !== false), parallel: results.length };
	Context.record(context, step, outcome);
	if (!outcome.ok && options.stopOnError && step.stopOnError !== false) {
		throw new Error("parallel_branch_failed");
	}
	return outcome;
}

async function runForEach(step, context, runAction, options, runSteps, depth) {
	const source = step.forEach.in || step.forEach.items || [];
	const resolved = await Values.resolveValue(source, context, runAction) || [];
	const values = Array.isArray(resolved) ? resolved : Object.values(resolved);
	for (let index = 0; index < values.length; index++) {
		context.vars[step.forEach.as || "item"] = values[index];
		context.vars.index = index;
		await runSteps(step.forEach.do || step.do || [], context, runAction, options, depth + 1);
	}
	return Context.record(context, step, { ok: true, forEach: values.length });
}

async function runLoop(kind, step, context, runAction, options, runSteps, depth) {
	const definition = step[kind];
	const maximum = Number(definition.maxIterations || step.maxIterations || options.maxSteps);
	let count = 0;
	while (count < maximum) {
		const condition = await Values.evaluateCondition(definition.condition || definition, context, runAction);
		if (!(kind === "until" ? !condition : condition)) break;
		count++;
		await runSteps(definition.do || step.do || [], context, runAction, options, depth + 1);
	}
	return Context.record(context, step, { ok: true, [kind]: count });
}

async function runAssert(step, context, runAction, options) {
	const ok = await Values.evaluateCondition(step.assert, context, runAction);
	const result = { ok, assertion: step.assert,
		message: ok ? "assertion_passed" : "assertion_failed" };
	Context.record(context, step, result);
	if (!ok && options.stopOnError && step.stopOnError !== false) throw new Error(result.message);
	return result;
}

function errorShape(error, step = {}) {
	return { message: error?.message || "action_failed", stack: error?.stack || "",
		step: step.action || step.type || step.call || null };
}

module.exports = { errorShape, runAssert, runForEach, runLoop, runParallel };
