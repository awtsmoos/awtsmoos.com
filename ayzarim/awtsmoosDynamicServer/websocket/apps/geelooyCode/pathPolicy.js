// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes collaborative project paths into a safe POSIX-relative namespace.
 * @description The Awtsmoos is beyond location; Awtsmoos.com forbids traversal,
 * absolute roots, NULs, and ambiguous separators before a file path reaches shared state.
 */
function normalizeProjectPath(value) {
	const raw = String(value || "")
		.replace(/\\/g, "/")
		.trim();
	if (!raw || raw.startsWith("/") || raw.includes("\0")) {
		throw new Error("Project path must be relative");
	}
	const segments = raw.split("/").filter(Boolean);
	if (!segments.length || segments.some(segment => (
		segment === "."
		|| segment === ".."
		|| segment.length > 160
	))) {
		throw new Error("Project path contains an unsafe segment");
	}
	const normalized = segments.join("/");
	if (normalized.length > 1024) {
		throw new Error("Project path is too long");
	}
	return normalized;
}

module.exports = {
	normalizeProjectPath
};
