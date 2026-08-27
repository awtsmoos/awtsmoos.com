// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

const FORBIDDEN_KEYS = new Set([
	"code",
	"script",
	"shell",
	"python",
	"javascript",
	"eval",
	"url",
	"uri",
	"network",
	"filesystem",
	"file_path",
	"command_line"
]);

const FORBIDDEN_STRING_PATTERNS = [
	/:\/\//i,
	/(^|[\s"'`])(curl|wget|powershell|bash|sh|python|node)\b/i,
	/\b(eval|exec|spawn|child_process|subprocess)\b/i,
	/(^|[^\w])(\.\.\/|\/etc\/|[a-z]:\\)/i
];

/**
 * Scans command arguments for executable, filesystem, or network payloads.
 *
 * @param {*} value Value being inspected.
 * @param {string} path JSON-like path.
 * @param {Array<Object>} issues Accumulated security issues.
 * @returns {Array<Object>} Security issues.
 */
export function collectUnsafeArgumentIssues(value, path = "/args", issues = []) {
	if (Array.isArray(value)) {
		value.forEach((item, index) => {
			collectUnsafeArgumentIssues(item, `${path}/${index}`, issues);
		});
		return issues;
	}
	if (!value || typeof value !== "object") {
		if (typeof value === "string") {
			for (const pattern of FORBIDDEN_STRING_PATTERNS) {
				if (pattern.test(value)) {
					issues.push({
						path,
						message: "Executable, filesystem, or network text is forbidden."
					});
					break;
				}
			}
		}
		return issues;
	}
	for (const [key, item] of Object.entries(value)) {
		const normalizedKey = key.toLowerCase();
		if (FORBIDDEN_KEYS.has(normalizedKey)) {
			issues.push({
				path: `${path}/${key}`,
				message: `Argument key "${key}" is forbidden.`
			});
		}
		collectUnsafeArgumentIssues(item, `${path}/${key}`, issues);
	}
	return issues;
}
