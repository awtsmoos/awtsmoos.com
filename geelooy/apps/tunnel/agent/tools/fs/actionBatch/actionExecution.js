// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Controls = require("./controls.js");
const Invocation = require("./actionInvocation.js");

async function runActionStep(step, context, runAction, options, depth, runSteps) {
	const attempts = Math.max(1, Number(step.retry?.times || step.retries || 1));
	await Invocation.sleep(Invocation.stepDelay(step));
	let terminal = { error: null, result: null, recorded: false };
	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		terminal = await executeAttempt(step, context, runAction, attempt, runSteps, options, depth);
		if (terminal.success) return;
		if (attempt < attempts) {
			await Invocation.sleep(Number(step.retry?.delayMs || options.retryDelayMs || 0));
		}
	}
	await finishFailure(step, context, runAction, options, depth, terminal, runSteps);
}

async function executeAttempt(step, context, runAction, attempt, runSteps, options, depth) {
	try {
		if (context.dryRun) {
			Context.record(context, step, {
				ok: true,
				dryRun: true,
				attempt
			}, attempt);
			return { success: true, error: null, result: null, recorded: true };
		}
		const result = await Invocation.invokeAction(step, context, runAction);
		Context.record(context, step, result, attempt);
		if (step.saveAs || step.id) context.named[step.saveAs || step.id] = result;
		if (result?.ok !== false) {
			if (step.then) {
				await runSteps(step.then, context, runAction, options, depth + 1);
			}
			return { success: true, error: null, result, recorded: true };
		}
		return {
			success: false,
			error: Invocation.resultError(result),
			result,
			recorded: true
		};
	} catch (error) {
		return { success: false, error, result: null, recorded: false };
	}
}

async function finishFailure(step, context, runAction, options, depth, terminal, runSteps) {
	const failure = Controls.errorShape(
		terminal.error || Invocation.resultError(terminal.result),
		step
	);
	context.error = failure;
	if (!terminal.recorded) {
		Context.record(context, step, { ok: false, error: failure });
	}
	if (step.onError) {
		await runSteps(step.onError, context, runAction, options, depth + 1);
	}
	if (options.stopOnError && step.stopOnError !== false) {
		throw terminal.error || Invocation.resultError(terminal.result);
	}
}

module.exports = {
	runActionStep
};
