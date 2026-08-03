// B"H
// Boruch Hashem
// Blessed is He

const Action = require("./actionExecution.js");
const Controls = require("./controls.js");
const Payload = require("./payload.js");
const Values = require("./values.js");

async function runOneStep(step, context, runAction, options, depth, runSteps) {
	if (context.results.length >= options.maxSteps) {
		throw new Error(`actionBatch maxSteps exceeded: ${options.maxSteps}`);
	}
	if (!step || typeof step !== "object") return;
	const condition = step.if || step.when || step.condition;
	if (condition) {
		const passed = await Values.evaluateCondition(condition, context, runAction);
		if (step.then || step.else || step.do) {
			return runSteps(
				passed ? step.then || step.do : step.else,
				context,
				runAction,
				options,
				depth + 1
			);
		}
		if (!passed) return;
	}
	if (step.parallel) {
		return Controls.runParallel(step, context, runAction, options, runSteps, depth);
	}
	if (step.forEach) {
		return Controls.runForEach(step, context, runAction, options, runSteps, depth);
	}
	if (step.until) {
		return Controls.runLoop("until", step, context, runAction, options, runSteps, depth);
	}
	if (step.while) {
		return Controls.runLoop("while", step, context, runAction, options, runSteps, depth);
	}
	if (step.assert) {
		return Controls.runAssert(step, context, runAction, options);
	}
	if (step.do && !step.action && !step.type && !step.call) {
		return runSteps(step.do, context, runAction, options, depth + 1);
	}
	return Action.runActionStep(step, context, runAction, options, depth, runSteps);
}

function list(steps) {
	return Payload.asSteps(steps);
}

module.exports = {
	list,
	runOneStep
};
