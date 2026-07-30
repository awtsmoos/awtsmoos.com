// B"H
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../../../../lib/config.js");

const DIRECTORY = path.join(ROOT, "private", "website-agent-missions");

function create(input = {}) {
	const id = safe(input.id) ||
		`webmission_${Date.now().toString(36)}_${crypto.randomBytes(5).toString("hex")}`;
	if (read(id)) {
		const error = new Error("website_mission_already_exists");
		error.code = "website_mission_already_exists";
		throw error;
	}
	const record = {
		schemaVersion: 2,
		id,
		status: "queued",
		phase: "planning",
		createdAt: now(),
		updatedAt: now(),
		finishedAt: null,
		plan: input.plan,
		goal: String(input.goal || ""),
		missionId: String(input.missionId || ""),
		lead: {
			agentId: "lead",
			status: "working_locally",
			instruction: "Continue useful local repository work while website specialists authenticate and run."
		},
		authentication: {
			status: "unchecked",
			loginOpened: false,
			lastCheckedAt: null,
			nextCheckAt: null
		},
		roomRevision: 0,
		lastAgentStartAt: null,
		agents: input.plan.agents.map(agent => agentState(id, agent)),
		events: [],
		cancelRequested: false,
		error: null
	};
	return save(record);
}

function agentState(missionId, agent) {
	return {
		...agent,
		agentSessionId: `${missionId}:${agent.id}`,
		status: "queued",
		round: 0,
		continuationTurns: 0,
		conversationKey: null,
		submissionAcceptedAt: null,
		pendingRound: null,
		lastUpdate: "",
		lastOutcome: null,
		roomCursorAt: null,
		roomDirty: false,
		pendingRoomMessages: 0,
		claimId: null,
		delegationId: null,
		error: null
	};
}

function read(id) {
	try {
		return normalize(JSON.parse(fs.readFileSync(file(id), "utf8")));
	} catch {
		return null;
	}
}

function normalize(record) {
	if (!record) return null;
	record.schemaVersion = 2;
	record.lead ||= {
		agentId: "lead",
		status: "working_locally",
		instruction: "Continue useful local repository work while website specialists run."
	};
	record.authentication ||= {
		status: "unchecked",
		loginOpened: false,
		lastCheckedAt: null,
		nextCheckAt: null
	};
	record.roomRevision ||= 0;
	record.lastAgentStartAt ||= null;
	record.events ||= [];
	record.agents = (record.agents || []).map(agent => ({
		...agentState(record.id, agent),
		...agent,
		agentSessionId: agent.agentSessionId || `${record.id}:${agent.id}`,
		continuationTurns: Number(agent.continuationTurns || 0),
		pendingRoomMessages: Number(agent.pendingRoomMessages || 0)
	}));
	return record;
}

function save(record) {
	record.updatedAt = now();
	fs.mkdirSync(DIRECTORY, { recursive: true, mode: 0o700 });
	const target = file(record.id);
	const temporary = `${target}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;
	fs.writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, {
		encoding: "utf8",
		mode: 0o600
	});
	fs.renameSync(temporary, target);
	fs.chmodSync(target, 0o600);
	return record;
}

function update(id, mutator) {
	const record = read(id);
	if (!record) return null;
	const result = mutator(record) || record;
	return save(result);
}

function event(record, type, details = {}) {
	record.events.push({ at: now(), type, ...details });
	record.events = record.events.slice(-1000);
	return save(record);
}

function remove(id) {
	try {
		fs.unlinkSync(file(id));
		return true;
	} catch (error) {
		return error.code === "ENOENT";
	}
}

function list(limit = 50) {
	try {
		return fs.readdirSync(DIRECTORY)
			.filter(name => name.endsWith(".json"))
			.map(name => read(path.basename(name, ".json")))
			.filter(Boolean)
			.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
			.slice(0, Math.max(1, Math.min(200, Number(limit) || 50)));
	} catch {
		return [];
	}
}

function publicRecord(record) {
	if (!record) return null;
	return {
		schemaVersion: record.schemaVersion,
		id: record.id,
		status: record.status,
		phase: record.phase,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
		finishedAt: record.finishedAt,
		missionId: record.missionId,
		goal: record.goal,
		lead: record.lead,
		authentication: record.authentication,
		roomRevision: record.roomRevision,
		plan: record.plan,
		agents: record.agents.map(agent => ({
			id: agent.id,
			agentSessionId: agent.agentSessionId,
			name: agent.name,
			role: agent.role,
			focus: agent.focus,
			scope: agent.scope,
			status: agent.status,
			round: agent.round,
			continuationTurns: agent.continuationTurns,
			submissionAcceptedAt: agent.submissionAcceptedAt,
			pendingRound: agent.pendingRound,
			lastUpdate: agent.lastUpdate,
			lastOutcome: agent.lastOutcome,
			pendingRoomMessages: agent.pendingRoomMessages,
			error: agent.error,
			hasPrivateContinuation: Boolean(agent.conversationKey)
		})),
		events: record.events.slice(-100),
		cancelRequested: record.cancelRequested,
		error: record.error
	};
}

function file(id) {
	return path.join(DIRECTORY, `${safe(id)}.json`);
}

function safe(value) {
	return String(value || "").trim().replace(/[^A-Za-z0-9_.-]+/g, "_").slice(0, 120);
}

function now() {
	return new Date().toISOString();
}

module.exports = {
	DIRECTORY,
	create,
	event,
	list,
	publicRecord,
	read,
	remove,
	save,
	update
};
