// B"H
// Boruch Hashem
// Blessed is He

const Invocation = require("./actionInvocation.js");
const Step = require("./stepExecution.js");

async function runSteps(steps, context, runAction, options, depth = 0) {
	const list = Step.list(steps);
	for (let index = 0; index < list.length; index += 1) {
		if (depth === 0 && index > 0) {
			await Invocation.sleep(options.staggerMs);
		}
		await Step.runOneStep(
			list[index],
			context,
			runAction,
			options,
			depth,
			runSteps
		);
	}
}

module.exports = {
	invokeAction: Invocation.invokeAction,
	resultError: Invocation.resultError,
	runSteps,
	sleep: Invocation.sleep
};
