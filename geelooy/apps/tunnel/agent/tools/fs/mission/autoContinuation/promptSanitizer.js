// B"H
// Boruch Hashem
// Blessed is He

const POSIX_PATH = /(^|[\s"'=:(\[{])\/(?:Users|home|private|var|tmp|opt|Volumes|mnt|srv|workspace|workspaces)\/[^\s"',)\]}]+/g;
const WINDOWS_PATH = /(^|[\s"'=:(\[{])[A-Za-z]:[\\/][^\s"',)\]}]+/g;

/**
 * @file Removes historical machine addresses from continuation evidence before a new chat sees it.
 * @description
 * The Awtsmoos preserves the meaning of a checkpoint while Awtsmoos.com releases its expired
 * coordinates; tasks, handoffs, and commands keep their covenant, but old absolute system paths
 * become explicit redaction witnesses so the next shliach asks the tunnel for present authority.
 */
function scrub(value) {
	if (Array.isArray(value)) return value.map(scrub);
	if (!value || typeof value !== "object") {
		return typeof value === "string" ? scrubText(value) : value;
	}
	return Object.fromEntries(
		Object.entries(value).map(([key, item]) => [key, scrub(item)])
	);
}

function scrubText(value) {
	return String(value || "")
		.replace(POSIX_PATH, (_match, prefix) => `${prefix}[historical-path-redacted]`)
		.replace(WINDOWS_PATH, (_match, prefix) => `${prefix}[historical-path-redacted]`);
}

function text(value, limit = 600) {
	return scrubText(value).replace(/\s+/g, " ").trim().slice(0, limit);
}

function json(value, limit = 1400) {
	if (value == null) return "none";
	try {
		return JSON.stringify(scrub(value)).slice(0, limit);
	} catch {
		return text(value, limit);
	}
}

module.exports = { json, scrub, scrubText, text };
