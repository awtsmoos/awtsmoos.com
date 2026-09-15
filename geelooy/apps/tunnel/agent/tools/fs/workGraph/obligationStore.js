//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const path = require("node:path");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");
const Sequence = require("./sequenceStore.js");

const STATES = new Set(["open", "satisfied", "superseded"]);

/**
 * @file Keeps unresolved duty durable across disposable agent sessions.
 * @description The Awtsmoos gives the obligation to the enduring logical shliach;
 * Awtsmoos.com records each incarnation that carries it without mutating earlier truth.
 */
function requireState(state) {
	const value = String(state || "");
	if (!STATES.has(value)) throw new Error(`obligation_state_invalid: ${value}`);
	return value;
}

async function all(config) {
	return Records.listJson(Paths.obligations(config));
}

async function current(config, filters = {}) {
	const latest = new Map();
	for (const item of await all(config)) {
		const previous = latest.get(item.obligationId);
		if (!previous || Number(item.sequence) > Number(previous.sequence)) {
			latest.set(item.obligationId, item);
		}
	}
	return [...latest.values()].filter(item => {
		if (filters.logicalAgentId && item.logicalAgentId !== filters.logicalAgentId) return false;
		if (filters.missionId && item.missionId !== filters.missionId) return false;
		if (filters.workId && item.workId !== filters.workId) return false;
		if (filters.state && item.state !== filters.state) return false;
		return true;
	});
}

async function append(config, details = {}) {
	const sequence = await Sequence.allocate(config);
	const obligationId = String(details.obligationId || `awtsmoos://obligation/${crypto.randomUUID()}`);
	const record = {
		schemaVersion: 1,
		transitionId: `awtsmoos://obligation-transition/${crypto.randomUUID()}`,
		obligationId,
		sequence,
		state: requireState(details.state || "open"),
		title: String(details.title || ""),
		body: String(details.body || ""),
		missionId: String(details.missionId || ""),
		workId: String(details.workId || ""),
		logicalAgentId: String(details.logicalAgentId || config.logicalAgentId || ""),
		agentSessionId: String(details.agentSessionId || config.agentSessionId || ""),
		sourceAssertionId: String(details.sourceAssertionId || ""),
		inheritedFromSessionId: String(details.inheritedFromSessionId || ""),
		createdAt: new Date().toISOString()
	};
	if (!record.logicalAgentId) throw new Error("obligation_logical_agent_required");
	const file = path.join(Paths.obligations(config), `${String(sequence).padStart(16, "0")}-${crypto.createHash("sha256").update(record.transitionId).digest("hex")}.json`);
	await Records.createImmutableJson(file, record);
	return record;
}

async function transition(config, obligationId, state, details = {}) {
	const prior = (await current(config)).find(item => item.obligationId === obligationId);
	if (!prior) throw new Error("obligation_not_found");
	return append(config, { ...prior, ...details, obligationId, state });
}

async function inheritSession(config, logicalAgentId, previousSessionId, nextSessionId) {
	const open = await current(config, { logicalAgentId, state: "open" });
	const inherited = [];
	for (const item of open) {
		if (item.agentSessionId === nextSessionId) continue;
		inherited.push(await transition(config, item.obligationId, "open", {
			agentSessionId: nextSessionId,
			inheritedFromSessionId: previousSessionId || item.agentSessionId
		}));
	}
	return inherited;
}

module.exports = { all, append, current, inheritSession, transition };
