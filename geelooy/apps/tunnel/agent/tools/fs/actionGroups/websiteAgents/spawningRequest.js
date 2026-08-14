// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/** Normalizes one bounded flat-peer request inside the canonical project root. */
function normalizeRequest(projectRoot, raw = {}) {
	const key = String(raw.key || raw.requestId || "").trim().toLowerCase();
	const role = String(raw.role || "specialist").trim().slice(0, 80);
	const prompt = String(raw.prompt || "").trim().slice(0, 16000);
	const scope = normalizeScope(projectRoot, raw.scope);
	if (!/^[a-z0-9][a-z0-9._:-]{0,95}$/.test(key) || !role || !prompt || !scope) {
		return null;
	}
	return { key, requestId: key, role, scope, prompt };
}

function normalizeScope(projectRoot, raw) {
	const root = path.resolve(projectRoot || process.cwd());
	const value = String(raw || "").trim();
	if (!value || value.includes("\0")) return "";
	const absolute = path.resolve(root, value);
	const relative = path.relative(root, absolute);
	if (relative === ".." || relative.startsWith(`..${path.sep}`)) return "";
	return relative || ".";
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = { bounded, normalizeRequest, normalizeScope };
