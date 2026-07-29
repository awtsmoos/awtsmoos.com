// B"H
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../../../../lib/config.js");

const DIRECTORY = path.join(ROOT, "private", "website-agent-missions");

function create(input = {}) {
	const id = safe(input.id) || `webmission_${Date.now().toString(36)}_${crypto.randomBytes(5).toString("hex")}`;
	const record = {
		schemaVersion: 1,
		id,
		status: "queued",
		phase: "planning",
		createdAt: now(),
		updatedAt: now(),
		finishedAt: null,
		plan: input.plan,
		goal: String(input.goal || ""),
		missionId: String(input.missionId || ""),
		agents: input.plan.agents.map(agent => ({
			...agent,
			status: "queued",
			round: 0,
			conversationKey: null,
			submissionAcceptedAt: null,
			lastUpdate: "",
			error: null
		})),
		events: [],
		cancelRequested: false,
		error: null
	};
	return save(record);
}

function read(id) {
	try {
		return JSON.parse(fs.readFileSync(file(id), "utf8"));
	} catch {
		return null;
	}
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
		plan: record.plan,
		agents: record.agents.map(agent => ({
			id: agent.id,
			name: agent.name,
			role: agent.role,
			focus: agent.focus,
			scope: agent.scope,
			status: agent.status,
			round: agent.round,
			submissionAcceptedAt: agent.submissionAcceptedAt,
			lastUpdate: agent.lastUpdate,
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

module.exports = { DIRECTORY, create, event, list, publicRecord, read, remove, save };
