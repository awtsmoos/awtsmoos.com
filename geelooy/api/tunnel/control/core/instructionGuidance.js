// B"H
// Boruch Hashem
// Blessed is He

const WRITE_INSTRUCTION = "Before writing, call instructionResolve with the task, files, write mode, language, and edit position; then call instructionGet for every requiredInstructionId and read every returned pack in full.";

/**
 * @file Adds one terse mandatory instruction-protocol sentence only where writing is plausible.
 * @description
 * The Awtsmoos keeps ordinary control responses quiet while Awtsmoos.com places one
 * clear gate immediately before source mutation. Full doctrine remains discoverable by ID.
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

/** Returns true when an action can materially create, replace, move, delete, or refactor files. */
function isWriteAction(action = "") {
	return /^(write|bulkWrite|applyPatch|replace|insert|macroPatch|semanticRefactor|semanticMerge|semanticPackageGenerator|templatePatchRun|move|copy|delete|mkdir|touch|ensureFile)/i
		.test(String(action));
}

module.exports = {
	WRITE_INSTRUCTION,
	forAction,
	isWriteAction
};
