// B"H
// Boruch Hashem
// Blessed is He

const Parsing = require("./parsing.js");

function normalizeJob(job, index, parentAction) {
	if (!job || typeof job !== "object") {
		return null;
	}
	const step = { ...job };
	if (!step.action && !step.type && !step.call &&
		parentAction === "aiCommandBatch" &&
		(step.prompt || step.goal || step.message)) {
		step.action = "aiWorkflowRun";
	}
	step.name = step.name || step.id || `job_${index + 1}`;
	if (step.delayMs === undefined && step.delaySeconds !== undefined) {
		step.delayMs = Number(step.delaySeconds) * 1000;
	}
	return step;
}

function normalizeCollection(value, parentAction) {
	return Parsing.asSteps(value)
		.map((job, index) => normalizeJob(job, index, parentAction))
		.filter(Boolean);
}

function normalizeSteps(payload) {
	const fused = Parsing.fusePayload(payload);
	if (Array.isArray(fused)) {
		return normalizeCollection(fused, "");
	}
	if (typeof fused === "string") {
		return normalizeSteps(Parsing.parseJson(fused, []));
	}
	const raw = Parsing.firstDefined(
		fused.steps,
		fused.actions,
		fused.workflow,
		fused.commandTree,
		fused.tree,
		fused.do,
		fused.plan,
		fused.jobs
	);
	const parsed = Parsing.parseJson(raw, raw);
	if (Array.isArray(parsed)) {
		return normalizeCollection(parsed, fused.action);
	}
	if (parsed && typeof parsed === "object") {
		const nested = Parsing.firstDefined(
			parsed.steps,
			parsed.actions,
			parsed.do,
			parsed.jobs
		);
		return normalizeCollection(nested || parsed, fused.action);
	}
	return normalizeCollection(parsed, fused.action);
}

function publicStep(step) {
	return {
		action: step.action || step.type || step.call || null,
		hasCondition: Boolean(step.if || step.when || step.condition),
		saveAs: step.saveAs || step.id || null,
		delayMs: Number(step.delayMs || step.waitMs || 0)
	};
}

function explainSteps(steps) {
	return Parsing.asSteps(steps).map((step, index) => ({
		index,
		...publicStep(step),
		control: controlKind(step)
	}));
}

function controlKind(step) {
	if (step.parallel) return "parallel";
	if (step.forEach) return "forEach";
	if (step.assert) return "assert";
	if (step.do && !step.action) return "group";
	return "action";
}

module.exports = {
	explainSteps,
	normalizeSteps,
	publicStep
};
