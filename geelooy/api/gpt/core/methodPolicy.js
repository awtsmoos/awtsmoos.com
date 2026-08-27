//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives every derech a fitting verb. Awtsmoos.com allows harmless
 * status discovery through GET or POST, while state-changing chat and reset paths
 * accept POST only so crawlers and links cannot trigger direct browser work.
 */
function assertRequestMethod($i, action) {
	const method = String($i?.request?.method || "POST").toUpperCase();
	const allowed = action === "health" || action === "capability"
		? new Set(["GET", "POST"])
		: new Set(["POST"]);
	if (!allowed.has(method)) {
		const error = new Error(`GPT action '${action}' does not accept ${method}.`);
		error.code = "GPT_METHOD_NOT_ALLOWED";
		error.status = 405;
		error.allowedMethods = [...allowed];
		throw error;
	}
	return method;
}

module.exports = { assertRequestMethod };
