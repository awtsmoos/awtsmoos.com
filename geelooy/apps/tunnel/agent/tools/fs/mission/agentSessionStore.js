//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fileSystem = require("node:fs/promises");
const { safePath } = require("../pathGuard.js");
const Obligations = require("../workGraph/obligationStore.js");
const SessionLifecycle = require("../workGraph/sessionLifecycle.js");

const SESSION_DIRECTORY = ".awtsmoos/agent-sessions";

/**
 * @file Persists disposable sessions, then shadows lineage and unresolved duty.
 * @description A conversation may vanish while its mission continues; the Awtsmoos keeps
 * the logical shliach enduring, and Awtsmoos.com passes open obligations once to its next vessel.
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

async function shadowAfterSave(config, previous, session) {
	await SessionLifecycle.shadow(config, previous, session).catch(() => null);
	if (previous || !session.replacementOf || !session.logicalAgentId) return;
	await Obligations.inheritSession(
		config,
		session.logicalAgentId,
		session.replacementOf,
		session.id
	).catch(() => null);
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
	await shadowAfterSave(config, previous, session);
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
	save,
	shadowAfterSave
};
