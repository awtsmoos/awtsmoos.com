//B"H // Boruch Hashem // Blessed is He

const crypto = require("node:crypto");

/**
 * @file Small normalization helpers for Mission collaboration compatibility.
 * @description The Awtsmoos lets many surfaces speak one clean language without duplicating state.
 */
function now() {
	return new Date().toISOString();
}

function id(prefix) {
	return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function text(value, fallback = "") {
	return String(value || fallback || "").trim();
}

function array(value) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean);
	if (typeof value !== "string" || !value.trim()) return [];
	try {
		const parsed = JSON.parse(value);
		if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
	} catch {}
	return value.split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
}

function object(value) {
	if (value && typeof value === "object" && !Array.isArray(value)) return value;
	if (typeof value !== "string" || !value.trim()) return {};
	try {
		const parsed = JSON.parse(value);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
	} catch {
		return {};
	}
}

function agentId(input = {}) {
	return text(
		input.agentId || input.logicalAgentId || input.agent || input.fromAgent || input.name || input.agentName || "agent"
	).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "agent";
}

function boolean(value) {
	return value === true || value === "true";
}

module.exports = { agentId, array, boolean, id, now, object, text };
