//B"H // Boruch Hashem // Blessed is He

const ResultView = require("../actionResultView.js");

/**
 * @file Holds one batch ledger with raw envelopes and normalized execution truth side by side.
 * @description The Awtsmoos preserves every original receipt while Awtsmoos.com also reveals the
 * terminal fruit directly, so callers need not peel preview, async, history, or transport envelopes
 * merely to learn whether an accepted deed actually began or completed. Preserved request
 * identities ride alongside every step so nested batches never lose the outer request id,
 * retry/dedupe keys, pagination cursors, or partial-success children.
 */
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
	const view = ResultView.inspect(result);
	const item = {
		name: step.name || step.id || step.saveAs || null,
		action: step.action || step.type || step.call || "control",
		ok: result?.ok !== false,
		attempt,
		result,
		view
	};
	context.results.push(item);
	if (!item.ok) context.ok = false;
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
	if (branch.error) context.error = branch.error;
	if (!branch.ok) context.ok = false;
}

function compactForReturn(value, maxInlineBytes) {
	if (!value || typeof value !== "object") return value;
	const text = JSON.stringify(value);
	const inlineBytes = Buffer.byteLength(text, "utf8");
	if (inlineBytes <= maxInlineBytes) return value;
	return {
		ok: value.ok !== false,
		compacted: true,
		inlineBytes,
		maxInlineBytes,
		actionId: value.actionId || value.result?.actionId || null,
		outputRef: value.outputRef || value.result?.outputRef || null,
		access: "Inspect the preserved raw result or output reference."
	};
}

function batchReturn(payload, context, acceptedCarriers, plan) {
	const maxInlineBytes = Number(payload.maxInlineBytes || 12000);
	const views = context.results.map(item => ({ name: item.name, action: item.action, ...item.view }));
	const terminalResults = views.filter(view => view.terminal).map(view => ({
		name: view.name,
		action: view.action,
		result: view.terminalResult
	}));
	const pendingSteps = views.filter(view => view.pending).map(view => ({
		name: view.name,
		action: view.action,
		executionProof: view.executionProof,
		transport: view.transport
	}));
	const identities = views.map(view => ({
		name: view.name,
		action: view.action,
		preserved: view.preserved || null,
		children: view.children || [],
		partialSuccess: view.partialSuccess || null
	}));
	const lastView = ResultView.inspect(context.last);
	const continuationPrompt = payload.continuationPrompt || payload.config?.continuationPrompt ||
		process.env.AWTSMOOS_CONTINUATION_PROMPT || "";
	return {
		ok: context.ok,
		action: payload.action || "actionBatch",
		count: context.results.length,
		finalInstruction: continuationPrompt ? { role: "user", content: continuationPrompt } : null,
		results: compactForReturn(context.results, maxInlineBytes),
		named: compactForReturn(context.named, maxInlineBytes),
		vars: compactForReturn(context.vars, maxInlineBytes),
		last: compactForReturn(context.last, maxInlineBytes),
		lastTerminalResult: lastView.terminal ? compactForReturn(lastView.terminalResult, maxInlineBytes) : null,
		terminalResults: compactForReturn(terminalResults, maxInlineBytes),
		pendingSteps,
		identities,
		error: context.error,
		compacted: true,
		maxInlineBytes,
		acceptedCarriers,
		plan
	};
}

module.exports = { batchReturn, createContext, forkContext, mergeContext, record };
