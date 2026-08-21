// B"H
// Boruch Hashem
// Blessed is He

const Emergency = require("./public-action-emergency.js");

const POLICY_VERSION = 1;
const PUBLIC_ACTIONS = Object.freeze([
	"agent",
	"batch",
	"browser",
	"command",
	"files",
	"git",
	"mission",
	"preview",
	"recover",
	"runtime",
	"status",
	"system",
	"test",
	"web"
]);
const PUBLIC_SET = new Set(PUBLIC_ACTIONS);
const KIND_PRECEDENCE = Object.freeze([
	"command",
	"chrome",
	"relay",
	"streaming",
	"fs"
]);

/**
 * @file Reveals fourteen public capabilities above the complete internal action universe.
 * @description
 * The Awtsmoos is simple while countless deeds unfold below; Awtsmoos.com exposes a
 * small stable covenant and lets specialized engines outrank broad compatibility aliases.
 */
function isPublicAction(action) {
	return PUBLIC_SET.has(String(action || ""));
}

/**
 * Assigns one internal operation to its public capability family.
 *
 * @param {string} operation Internal executable action name.
 * @param {object} manifest Grouped internal action manifest from registration.
 * @returns {string} One of the fourteen public capability names.
 */
function familyForOperation(operation, manifest = {}) {
	const name = String(operation || "");
	if (!name || isPublicAction(name)) return "";
	const emergency = Emergency.family(name);
	if (emergency) return emergency;
	const kind = kindForOperation(name, manifest);
	if (kind === "chrome") return "browser";
	if (kind === "command") return "command";
	if (kind === "relay" || kind === "streaming") return "web";
	return familyForFsName(name);
}

/**
 * Resolves overlapping registries by preferring the narrow executable engine.
 *
 * @param {string} operation Exact internal action name.
 * @param {object} manifest Grouped action manifest.
 * @returns {string} Runtime kind or an empty string.
 */
function kindForOperation(operation, manifest = {}) {
	for (const kind of KIND_PRECEDENCE) {
		if (Array.isArray(manifest[kind]) && manifest[kind].includes(operation)) {
			return kind;
		}
	}
	return "";
}

function familyForFsName(name) {
	if (/^mission/i.test(name)) return "mission";
	if (/^git/i.test(name)) return "git";
	if (/^(chrome|browser|remoteDesktop|interaction)/i.test(name)) return "browser";
	if (/^(http|network|api|endpoint|oauth|transport|.*Cookie)/i.test(name)) return "web";
	if (/^(preview|staticServer)/i.test(name)) return "preview";
	if (/^(ai|websiteAgent|subagent|handoff|goalCompiler|agentSelfMail)/i.test(name)) return "agent";
	if (/^(actionBatch|commandBatch|aiCommandBatch|workflow|commandTree|forEachActionBatch|parallelActionBatch)/i.test(name)) return "batch";
	if (/^(test|lint|typecheck|coverage|syntax|nodeCheck|nodeInstant|instantTests|watchTest|mutation|perfBudget|buildRunner|previewBuildRunner|check)/i.test(name)) return "test";
	if (/^(command|shell|nodeScript|process|port|npm|packageScript|serverStart|serverStop)/i.test(name)) return "command";
	if (/^(read|write|copy|move|delete|mkdir|makeFolder|tree|grep|find|stat|touch|ensureFile|file|bulkWrite|selectString|recentFiles|largeFiles|duplicateBasenames|textStats)/i.test(name)) return "files";
	if (/^(runtime|simulate|env|config|dependency|workspace|repo|architecture|infer|detect|bundleTrace|routeAudit|moduleGraph|symbol|importResolver|absoluteImport|semantic|tool|provider|model|openApi|schema|policy|security|credential|lockfile|packageManager|installPlan)/i.test(name)) return "runtime";
	return "system";
}

function descriptor() {
	return {
		policyVersion: POLICY_VERSION,
		actions: [...PUBLIC_ACTIONS],
		statusOperations: [...Emergency.STATUS_OPERATIONS],
		recoveryOperations: [...Emergency.RECOVERY_OPERATIONS]
	};
}

module.exports = {
	KIND_PRECEDENCE,
	POLICY_VERSION,
	PUBLIC_ACTIONS,
	PUBLIC_SET,
	descriptor,
	familyForOperation,
	isPublicAction,
	kindForOperation
};
