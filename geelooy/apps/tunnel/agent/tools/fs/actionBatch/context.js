// B"H
// Boruch Hashem
// Blessed is He

function createContext(payload = {}) {
	return {
		ok: true,
		vars: objectish(payload.vars),
		policy: objectish(payload.policy),
		results: [],
		named: {},
		last: null,
		error: null,
		dryRun: Boolean(payload.dryRun || payload.explainOnly || payload.validateOnly)
	};
}

function objectish(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function record(context, step, result, attempt = 1) {
	context.last = result;
	const item = {
		name: step.name || step.id || step.saveAs || null,
		action: step.action || step.type || step.call || "control",
		ok: result?.ok !== false,
		attempt,
		result
	};
	context.results.push(item);
	if (!item.ok) {
		context.ok = false;
	}
	return item;
}

function forkContext(context) {
	return {
		...context,
		results: [],
		named: { ...context.named },
		vars: { ...context.vars },
		last: context.last,
		error: null
	};
}

function mergeContext(context, branch) {
	context.results.push(...branch.results);
	Object.assign(context.named, branch.named);
	Object.assign(context.vars, branch.vars);
	context.last = branch.last || context.last;
	if (branch.error) {
		context.error = branch.error;
	}
	if (!branch.ok) {
		context.ok = false;
	}
}

function compactForReturn(value, maxInlineBytes) {
	if (!value || typeof value !== "object") {
		return value;
	}
	const text = JSON.stringify(value);
	const inlineBytes = Buffer.byteLength(text, "utf8");
	if (inlineBytes <= maxInlineBytes) {
		return value;
	}
	return {
		ok: value.ok !== false,
		compacted: true,
		inlineBytes,
		maxInlineBytes,
		actionId: value.actionId || value.result?.actionId || null,
		outputRef: value.outputRef || value.result?.outputRef || null,
		access: "Increase maxInlineBytes or inspect parent outputRef/action history."
	};
}

function batchReturn(payload, context, acceptedCarriers, plan) {
	const maxInlineBytes = Number(payload.maxInlineBytes || 12000);
	const continuationPrompt = payload.continuationPrompt ||
		payload.config?.continuationPrompt ||
		process.env.AWTSMOOS_CONTINUATION_PROMPT ||
		"";
	return {
		ok: context.ok,
		action: payload.action || "actionBatch",
		count: context.results.length,
		finalInstruction: continuationPrompt
			? { role: "user", content: continuationPrompt }
			: null,
		results: compactForReturn(context.results, maxInlineBytes),
		named: compactForReturn(context.named, maxInlineBytes),
		vars: compactForReturn(context.vars, maxInlineBytes),
		last: compactForReturn(context.last, maxInlineBytes),
		error: context.error,
		compacted: true,
		maxInlineBytes,
		acceptedCarriers,
		plan
	};
}

module.exports = {
	batchReturn,
	createContext,
	forkContext,
	mergeContext,
	record
};
