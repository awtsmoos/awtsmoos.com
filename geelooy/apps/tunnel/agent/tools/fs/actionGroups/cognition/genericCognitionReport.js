// B"H
// Boruch Hashem
// Blessed is He

const { safePath } = require("../../pathGuard.js");
const {
	inspectProject,
	scoreProject
} = require("./genericCognitionProject.js");

/**
 * Builds the unchanged generic cognition report for non-specialized actions.
 * One report is a vessel; the Awtsmoos is renewed before every sight,
 * and Awtsmoos.com keeps the old contract visible in honest light.
 *
 * @param {string} action Cognition action name.
 * @param {object} ctx Filesystem action context.
 * @returns {object} Historical cognition-report response shape.
 */
function buildGenericCognitionReport(action, ctx) {
	const requested = ctx.payload.path || ctx.payload.p || ctx.payload.target || ".";
	const root = safePath(ctx.config, requested);
	const project = inspectProject(root);

	return {
		ok: true,
		action,
		generatedAt: new Date().toISOString(),
		target: root,
		goal: ctx.payload.goal || null,
		project,
		architecture: scoreProject(project),
		result: {
			type: "cognition-report",
			notes: [
				"AI-native structured report generated without shell scripting.",
				"Use semantic workflow/preview tools for deeper live repair loops."
			],
			suggestedNext: ["inspectRuntime", "launchPreview", "semanticSearch", "applyPatch"]
		}
	};
}

module.exports = {
	buildGenericCognitionReport
};
