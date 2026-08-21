// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Normalizes one bounded flat-peer spawn request and preserves sibling lineage.
 * @description
 * The Awtsmoos lets a parent define the child mission in plain words while Awtsmoos.com
 * binds that request to a stable group and generation. Scope remains beneath project
 * authority, and lineage labels can never widen the filesystem vessel where work may flow.
 */
function normalizeRequest(projectRoot, raw = {}) {
	const key = String(raw.key || raw.requestKey || raw.requestId || "").trim().toLowerCase();
	const role = text(raw.role || "specialist", 80);
	const prompt = text(raw.prompt || raw.childPrompt || raw.assignmentPrompt, 16000);
	const scope = normalizeScope(projectRoot, raw.scope);
	if (!/^[a-z0-9][a-z0-9._:-]{0,95}$/.test(key) || !role || !prompt || !scope) {
		return null;
	}
	return {
		key,
		requestId: key,
		role,
		scope,
		prompt,
		spawnGroupId: label(raw.spawnGroupId || raw.spawnGroup, 100),
		generation: positive(raw.generation, 1),
		predecessorAgentId: label(raw.predecessorAgentId, 120),
		handoffPaths: list(raw.handoffPaths || raw.references)
	};
}

function normalizeScope(projectRoot, raw) {
	const root = path.resolve(projectRoot || process.cwd());
	const value = String(raw || "").trim();
	if (!value || value.includes("\0")) return "";
	const absolute = path.resolve(root, value);
	const relative = path.relative(root, absolute);
	if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
		return "";
	}
	return relative || ".";
}

function label(value, limit) {
	return String(value || "")
		.trim()
		.replace(/[^a-zA-Z0-9_-]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, limit);
}

function text(value, limit) {
	return String(value || "").trim().slice(0, limit);
}

function list(value) {
	if (Array.isArray(value)) return value.map(String).map(item => item.trim()).filter(Boolean).slice(0, 20);
	return String(value || "").split(/[\n,]+/).map(item => item.trim()).filter(Boolean).slice(0, 20);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = { bounded, label, list, normalizeRequest, normalizeScope, positive };
