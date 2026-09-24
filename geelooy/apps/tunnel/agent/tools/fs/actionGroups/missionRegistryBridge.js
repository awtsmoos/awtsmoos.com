//B"H // Boruch Hashem // Blessed is He

const WebsiteStore = require("./websiteAgents/store.js");
const IdentityResolver = require("./missionIdentityResolver.js");

/**
 * @file Bridges ordinary Mission lookup with the distinct durable website-Mission registry.
 * @description The Awtsmoos keeps two ledgers without making a Shliach guess which ledger owns an
 * id. Awtsmoos.com discovers website lineage by either websiteMissionId or collaboration missionId,
 * normalizes legacy durable records, and suggests the registry-native follow-up action. Public
 * views delegate to the canonical mission identity resolver so every observation carries the same
 * kind, collaboration lineage, and canonical status action.
 */
function find(identifier) {
	const id = String(identifier || "").trim();
	if (!id) return null;
	const direct = WebsiteStore.read(id);
	if (direct) return direct;
	return WebsiteStore.list(500).find(record => String(record.missionId || "") === id) || null;
}

function publicView(record, action = "missionGet") {
	if (!record) return null;
	const view = IdentityResolver.publicView(record, action);
	return {
		...view,
		mission: WebsiteStore.publicRecord(normalize(record)),
		observationOnly: true
	};
}

function normalize(record = {}) {
	return {
		...record,
		agents: Array.isArray(record.agents) ? record.agents : [],
		events: Array.isArray(record.events) ? record.events : []
	};
}

function mismatch(record, action) {
	return {
		ok: false,
		action,
		error: "mission_registry_mismatch",
		registry: "website",
		websiteMissionId: record?.id || "",
		missionId: record?.missionId || "",
		message: "This id belongs to the website-Mission registry; use the website-agent action surface.",
		next: record ? {
			action: "websiteAgentMissionStatus",
			websiteMissionId: record.id
		} : null
	};
}

module.exports = { find, mismatch, normalize, publicView };
