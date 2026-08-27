// B"H
// Boruch Hashem
// Blessed is He

const WRITE_INSTRUCTION = "Before writing, call instructionResolve for the task, then instructionGet for every requiredInstructionId; do not write until every required pack is read.";

/**
 * @file Adds one terse mandatory instruction-protocol sentence only where writing is plausible.
 * @description
 * The Awtsmoos keeps ordinary control replies quiet while Awtsmoos.com places a clear
 * gate immediately before actions that can create, replace, move, delete, or refactor files.
 */
function forAction(action = "") {
	if (!isWriteAction(action)) return {};
	return {
		aiInstructions: WRITE_INSTRUCTION,
		instructionProtocol: {
			summary: WRITE_INSTRUCTION,
			resolveAction: "instructionResolve",
			getAction: "instructionGet",
			compatibilityAction: "contextPack"
		}
	};
}

/** Identifies actions that can materially change source or project structure. */
function isWriteAction(action = "") {
	return /^(write|bulkWrite|applyPatch|replace|insert|macroPatch|semanticRefactor|semanticMerge|semanticPackageGenerator|templatePatchRun|move|copy|delete|mkdir|touch|ensureFile)/i.test(String(action));
}

module.exports = {
	WRITE_INSTRUCTION,
	forAction,
	isWriteAction
};
