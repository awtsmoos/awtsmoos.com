// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

const FORBIDDEN_KEYS = new Set([
	"code",
	"script",
	"python",
	"javascript",
	"shell",
	"command",
	"filesystem_path",
	"network_address",
	"url"
]);

const FORBIDDEN_TEXT = Object.freeze([
	/\b(?:eval|exec|spawn|fork)\s*\(/i,
	/\b(?:python|bash|zsh|powershell|cmd\.exe)\b/i,
	/https?:\/\//i,
	/(?:^|\s)(?:\.\.\/|\/etc\/|[A-Za-z]:\\)/,
	/\b(?:rm\s+-rf|del\s+\/f|curl\s|wget\s)/i
]);

/**
 * Searches untrusted recipe data for code, paths, and network instructions.
 *
 * @param {*} value Value to inspect.
 * @param {string} path JSON-like path.
 * @param {object} result Validation result.
 */
export function validateSafeRecipeValue(value, path, result) {
	if (Array.isArray(value)) {
		value.forEach((item, index) => {
			validateSafeRecipeValue(item, `${path}/${index}`, result);
		});
		return;
	}
	if (value && typeof value === "object") {
		for (const [key, child] of Object.entries(value)) {
			if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
				result.addError(`${path}/${key}`, "Forbidden executable or external field.");
			}
			validateSafeRecipeValue(child, `${path}/${key}`, result);
		}
		return;
	}
	if (typeof value === "string") {
		for (const pattern of FORBIDDEN_TEXT) {
			if (pattern.test(value)) {
				result.addError(path, "Forbidden executable, path, or network text.");
				break;
			}
		}
	}
}
