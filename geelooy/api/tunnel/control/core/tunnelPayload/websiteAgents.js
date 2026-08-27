// B"H
// Boruch Hashem
// Blessed is He

const Parse = require("./parse.js");

/** Preserves only the bounded public website-agent contract. */
function fields(raw = {}, action = "") {
	if (!websiteAction(action)) return {};
	return clean({
		websiteMissionId: raw.websiteMissionId,
		parentWebsiteMissionId: raw.parentWebsiteMissionId,
		parentMissionId: raw.parentMissionId,
		parentAgentId: raw.parentAgentId,
		requestKey: raw.requestKey,
		spawnRequestKey: raw.spawnRequestKey,
		childRequestId: raw.childRequestId,
		role: raw.role,
		scope: raw.scope,
		childPrompt: raw.childPrompt,
		kind: raw.kind,
		evidence: raw.evidence,
		reportId: raw.reportId,
		next: raw.next,
		findings: raw.findings,
		references: list(raw.references),
		files: list(raw.files),
		toAgent: raw.toAgent,
		body: raw.body,
		message: raw.message || Parse.from64(raw.message64),
		prompt: raw.prompt || Parse.from64(raw.prompt64),
		goal: raw.goal || Parse.from64(raw.goal64),
		complete: Parse.boolValue(raw.complete),
		refreshAuthentication: Parse.boolValue(raw.refreshAuthentication)
	});
}

function websiteAction(action) {
	const name = String(action || "");
	return name === "agent" || name.startsWith("aiAgent") ||
		name.startsWith("websiteAgent") || name === "chatgptWebsiteLogout";
}

function list(value) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean).slice(0, 100);
	const text = String(value || "").trim();
	if (!text) return undefined;
	try {
		const parsed = JSON.parse(text);
		if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean).slice(0, 100);
	} catch {}
	return text.split(/[\n,]+/).map(item => item.trim()).filter(Boolean).slice(0, 100);
}

function clean(input) {
	return Object.fromEntries(Object.entries(input).filter(([, value]) =>
		value !== undefined && value !== null && value !== ""
	));
}

module.exports = { fields, list, websiteAction };
