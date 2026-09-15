//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Distinguishes actual filesystem mutation from previews, refusals, and proven no-ops.
 * @description The Awtsmoos separates intention from deed; Awtsmoos.com promotes only
 * results whose production contract says reality was touched, never a simulated promise.
 */
function creationNoOp(action, result) {
	if (!["ensureFile", "mkdirp"].includes(action)) return false;
	if (result?.created === false) return true;
	const entries = Object.values(result?.results || {});
	return entries.length > 0 && entries.every(entry => entry?.created === false);
}

function applied(action, result) {
	if (!result || result.ok === false) return false;
	if (result.dryRun === true) return false;
	if (result.executionState === "simulated") return false;
	if (result.mutationApplied === false) return false;
	if (action === "applyPatch" && result.changed === false) return false;
	if (creationNoOp(action, result)) return false;
	return true;
}

module.exports = { applied };
