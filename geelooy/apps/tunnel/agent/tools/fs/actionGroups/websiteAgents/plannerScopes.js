// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Reveals safe non-overlapping repository scopes for a durable agent swarm.
 * @description
 * The Awtsmoos gives each shliach a bounded vessel; Awtsmoos.com rejects paths
 * beyond the chosen root so a hundred queued agents cannot trample foreign ground.
 */
function scopeCandidates(projectRoot, input = {}) {
	const supplied = array(input.scopes || input.directories || input.paths);
	const mentioned = pathMentions(String(input.prompt || input.goal || input.message || ""));
	const discovered = topLevelDirectories(projectRoot);
	const values = [...supplied, ...mentioned, ...discovered]
		.map(value => normalizeScope(projectRoot, value))
		.filter(Boolean);
	const unique = [...new Set(values)].slice(0, 96);
	return unique.length ? unique : ["."];
}

function pathMentions(text) {
	return (text.match(/(?:^|[\s"'`(])(?:\.?\/)?[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+/g) || [])
		.map(value => value.trim().replace(/^["'`(]+|[,"'`)]+$/g, ""));
}

function topLevelDirectories(root) {
	try {
		return fs.readdirSync(root, { withFileTypes: true })
			.filter(entry => entry.isDirectory() && !entry.name.startsWith(".") &&
				!["node_modules", "logs", "dist", "build"].includes(entry.name))
			.map(entry => entry.name)
			.slice(0, 48);
	} catch {
		return [];
	}
}

function normalizeScope(root, value) {
	const text = String(value || "").trim();
	if (!text || text.includes("\0")) return "";
	const absolute = path.resolve(root, text);
	const relative = path.relative(root, absolute);
	if (relative === ".." || relative.startsWith(`..${path.sep}`)) return "";
	return relative || ".";
}

function array(value) {
	if (Array.isArray(value)) return value.map(String);
	if (!value) return [];
	try {
		const parsed = JSON.parse(String(value));
		if (Array.isArray(parsed)) return parsed.map(String);
	} catch {}
	return String(value).split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
}

module.exports = { normalizeScope, scopeCandidates };
