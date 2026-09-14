//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("node:crypto");
const fileSystem = require("node:fs/promises");
const { safePath } = require("../pathGuard.js");

const SESSION_DIRECTORY = ".awtsmoos/agent-sessions";

/**
 * @file Persists disposable ChatGPT/agent sessions outside every durable mission.
 * @description
 * A conversation may vanish while its mission continues. Each session therefore
 * receives its own atomic document, allowing replacement chats to reconnect without
 * making browser conversation lifetime the owner of project truth.
 */
function clean(value = "") {
	return String(value).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 160);
}

/** Resolves the private session directory beneath the authorized Tunnel root. */
function directory(config) {
	return safePath(config, SESSION_DIRECTORY);
}

/** Resolves one session document without accepting path traversal. */
function file(config, sessionId) {
	return safePath(config, `${SESSION_DIRECTORY}/${clean(sessionId)}.json`);
}

/** Atomically saves one independent session generation. */
async function save(config, session = {}) {
	await fileSystem.mkdir(directory(config), { recursive: true });
	const sessionId = clean(session.id);
	if (!sessionId) {
		throw new Error("agent_session_id_required");
	}
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
	return session;
}

/** Loads one session or returns null when its disposable chat never existed. */
async function load(config, sessionId) {
	try {
		const text = await fileSystem.readFile(file(config, sessionId), "utf8");
		return JSON.parse(text);
	} catch {
		return null;
	}
}

/** Lists every session document without coupling them to mission storage. */
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
