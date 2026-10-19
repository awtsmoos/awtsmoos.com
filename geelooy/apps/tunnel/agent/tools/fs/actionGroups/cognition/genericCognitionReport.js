// B"H
/**
 * @file genericCognitionReport.js
 * @description The Awtsmoos renews each world with truth. The messenger
 * may describe a room, but shall not claim to have repaired its walls.
 */
const { safePath } = require("../../pathGuard.js");
const { inspectProject, scoreProject } = require("./genericCognitionProject.js");

/**
 * Identify an action for which project inspection is the only implemented work.
 * @param {string} action Requested operation.
 * @returns {object} Truthful failure contract with an inspection-only result.
 */
function describeUnimplementedAction(action) {
	return {
		ok: false,
		action,
		performed: false,
		analysisOnly: true,
		error: "cognition_action_not_implemented",
		message: `${action} has no native executor in this action group. Project inspection is not proof that the requested operation ran.`,
		result: {
			type: "project-inspection-only",
			inspectionPerformed: true,
			requestedActionPerformed: false,
			notes: [
				"Project metadata was inspected; the requested action was not executed.",
				"Use a concrete native action with an execution receipt to prove work."
			],
			suggestedNext: ["commandRun", "commandStatus", "chromeEval"]
		}
	};
}

/** Inspect project evidence without falsely reporting an executed action. */
function buildGenericCognitionReport(action, context) {
	const payload = context.payload || {};
	const requested = payload.path || payload.p || payload.target || ".";
	const root = safePath(context.config, requested);
	const project = inspectProject(root);

	return {
		...describeUnimplementedAction(action),
		generatedAt: new Date().toISOString(),
		target: root,
		goal: payload.goal || null,
		project,
		architecture: scoreProject(project)
	};
}

module.exports = { buildGenericCognitionReport, describeUnimplementedAction };
