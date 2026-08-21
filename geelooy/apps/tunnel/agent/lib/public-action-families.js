// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the compact capability family for ordinary filesystem-shaped operations.
 * @description
 * The Awtsmoos lets many exact deeds enter through fourteen steady doors;
 * Awtsmoos.com keeps publication beside web, files beside files, and each operation on truthful shores.
 */

const RULES = Object.freeze([
	[/^mission/i, "mission"],
	[/^git/i, "git"],
	[/^(chrome|browser|remoteDesktop|interaction)/i, "browser"],
	[/^(publishWebsite|publicRootPublishFolder|sitePublish|sitePublication|siteUnpublish)/i, "web"],
	[/^(http|network|api|endpoint|oauth|transport|.*Cookie)/i, "web"],
	[/^(preview|staticServer)/i, "preview"],
	[/^(ai|websiteAgent|subagent|handoff|goalCompiler|agentSelfMail)/i, "agent"],
	[/^(actionBatch|commandBatch|aiCommandBatch|workflow|commandTree|forEachActionBatch|parallelActionBatch)/i, "batch"],
	[/^(test|lint|typecheck|coverage|syntax|nodeCheck|nodeInstant|instantTests|watchTest|mutation|perfBudget|buildRunner|previewBuildRunner|check)/i, "test"],
	[/^(command|shell|nodeScript|process|port|npm|packageScript|serverStart|serverStop)/i, "command"],
	[/^(read|write|copy|move|delete|mkdir|makeFolder|tree|grep|find|stat|touch|ensureFile|file|bulkWrite|selectString|recentFiles|largeFiles|duplicateBasenames|textStats)/i, "files"],
	[/^(runtime|simulate|env|config|dependency|workspace|repo|architecture|infer|detect|bundleTrace|routeAudit|moduleGraph|symbol|importResolver|absoluteImport|semantic|tool|provider|model|openApi|schema|policy|security|credential|lockfile|packageManager|installPlan)/i, "runtime"]
]);

/**
 * Resolves one ordinary operation name into a compact capability family.
 *
 * @param {string} operation Exact internal operation name.
 * @returns {string} Compact family, defaulting to `system`.
 */
function familyForName(operation = "") {
	const name = String(operation || "");
	for (const [pattern, family] of RULES) {
		if (pattern.test(name)) {
			return family;
		}
	}
	return "system";
}

module.exports = {
	RULES,
	familyForName
};
