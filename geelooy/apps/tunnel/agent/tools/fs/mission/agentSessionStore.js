//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fileSystem = require("node:fs/promises");
const { safePath } = require("../pathGuard.js");
const SessionLifecycle = require("../workGraph/sessionLifecycle.js");

const SESSION_DIRECTORY = ".awtsmoos/agent-sessions";

/**
 * @file Persists disposable sessions, then shadows only meaningful incarnation changes.
 * @description A conversation may vanish while its mission continues; the Awtsmoos keeps
 * the session disposable, and Awtsmoos.com preserves lineage without logging every pulse.
 */
function clean(value = "") {
	return String(value).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 160);
}

function directory(config) {
	return safePath(config, SESSION_DIRECTORY);
}

function file(config, sessionId) {
	return safePath(config, `${SESSION_DIRECTORY}/${clean(sessionId)}.json`);
}

async function save(config, session = {}) {
	await fileSystem.mkdir(directory(config), { recursive: true });
	const sessionId = clean(session.id);
	if (!sessionId) throw new Error("agent_session_id_required");
	const previous = await load(config, sessionId);
	const temporary = safePath(
		config,
		`${SESSION_DIRECTORY}/.${sessionId}.${process.pid}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}.tmp`
	);
	await fileSystem.writeFile(
		temporary,
		JSON.stringify(session, null, 2),
		{ encoding: "utf8", mode: 0o600 }
	);
	await fileSystem.rename(temporary, file(config, sessionId));
	await SessionLifecycle.shadow(config, previous, session).catch(() => null);
	return session;
}

async function load(config, sessionId) {
	try {
		const text = await fileSystem.readFile(file(config, sessionId), "utf8");
		return JSON.parse(text);
	} catch {
		return null;
	}
}

async function all(config) {
	await fileSystem.mkdir(directory(config), { recursive: true });
	const entries = await fileSystem.readdir(directory(config), { withFileTypes: true });
	const sessions = [];
	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
		const session = await load(config, entry.name.slice(0, -5));
		if (session) sessions.push(session);
	}
	return sessions.sort((left, right) => {
		return String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || ""));
	});
}

module.exports = {
	SESSION_DIRECTORY,
	all,
	clean,
	directory,
	file,
	load,
	save
};
