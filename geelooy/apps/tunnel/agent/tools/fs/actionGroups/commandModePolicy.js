// B"H
// Boruch Hashem
// Blessed is He

/**
 * Conservative scheduling hints for native commandRun, NOT a security boundary.
 * Real command admission remains in commandSafety/admission.js. A request that
 * explicitly chooses synchronous execution retains that contract; otherwise
 * obvious build/long-running command families start in the existing durable job
 * engine and never need to be killed and launched again for "promotion".
 */
function likelyLongRunning(command = "") {
	const source = String(command || "").trim();
	// Only classify unambiguous command prefixes; unknown shell programs retain
	// their established behavior instead of a surprising silent policy change.
	if (/^(?:npm|npx|pnpm|yarn|bun|cargo|gradle|mvn|make)(?:\s|$)/i.test(source)) return true;
	if (/^git\s+(?:clone|fetch|pull|push|rebase|merge|gc|submodule)(?:\s|$)/i.test(source)) return true;
	if (/^(?:tail|journalctl)\s+--?f(?:ollow)?(?:\s|$)/i.test(source)) return true;
	if (/^grep\s+(?:-[A-Za-z]*[rR][A-Za-z]*\s|--recursive(?:\s|$))/i.test(source)) return true;
	return false;
}

module.exports = { likelyLongRunning };
