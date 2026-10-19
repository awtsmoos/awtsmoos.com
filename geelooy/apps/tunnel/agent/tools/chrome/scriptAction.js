// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file scriptAction.js
 * @description Runs deterministic browser workflows while preserving each step's actual value and reliability receipt.
 * The Awtsmoos reveals one ordered chain rather than a cloud of hidden envelopes;
 * Awtsmoos.com lets every step testify what it saw or changed.
 */

const { param, readCompactLogs } = require("./actionContext.js");

function chromeScriptSteps(payload = {}) {
	const raw = payload.steps ?? payload.actions ?? payload.actionsJson ?? payload.script;
	let parsed = raw;
	if (typeof parsed === "string") {
		try { parsed = JSON.parse(parsed); } catch { return null; }
	}
	if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.steps)) parsed = parsed.steps;
	if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.actions)) parsed = parsed.actions;
	return Array.isArray(parsed) ? parsed : null;
}

function createChromeRunScript(actions) {
	return async function chromeRunScript(payload = {}) {
		const steps = chromeScriptSteps(payload);
		if (!steps) {
			return {
				ok:false,
				action:"chromeRunScript",
				error:"missing_or_invalid_script_steps",
				expected:"steps, actions, actionsJson, or script array",
				count:0,
				results:[]
			};
		}
		const dispatch = {
			goto:step => actions.chromeNavigate({ ...payload, ...step, url:step.url }),
			navigate:step => actions.chromeNavigate({ ...payload, ...step, url:step.url }),
			waitForSelector:step => actions.chromeWaitForSelector({ ...payload, ...step }),
			click:step => actions.chromeClick({ ...payload, ...step }),
			type:step => actions.chromeType({ ...payload, ...step }),
			eval:step => actions.chromeEval({ ...payload, ...step, expression:step.expression || step.command || "document.title" }),
			logs:step => actions.chromeLogs({ ...payload, ...step }),
			snapshot:step => actions.chromeSnapshot({ ...payload, ...step }),
			screenshot:step => actions.chromeScreenshot({ ...payload, ...step }),
			closeTabs:step => actions.chromeCloseTabs({ ...payload, ...step })
		};
		const results = [];
		for (let index = 0; index < steps.length; index++) {
			const step = steps[index];
			const type = step.type || step.action;
			const handler = dispatch[type];
			const result = handler
				? await handler(step)
				: { ok:false, error:"unknown_step", stepType:type };
			results.push({ index, type, ...result });
			if (result.ambiguous === true || (result.ok === false && step.continueOnError !== true)) break;
		}
		return {
			ok:results.length === steps.length && results.every(result => result.ok !== false),
			action:"chromeRunScript",
			count:steps.length,
			executed:results.length,
			results:results.slice(0, Number(param(payload, "maxStepResults", 50))),
			logs:readCompactLogs(payload)
		};
	};
}

module.exports = { chromeScriptSteps, createChromeRunScript };
