// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Owns atomic persistent state and locking for subagent settlement spacing.
 * @description
 * The Awtsmoos lets timing truth survive process boundaries without becoming a second scheduler;
 * Awtsmoos.com guards one tiny settlement witness atomically while the global browser queue
 * remains the physical authority whose verified-close covenant no local file may overrule.
 */
const stateRoot = process.env.AWTSMOOS_TUNNEL_STATE_ROOT
	|| path.join(os.homedir(), ".awtsmoos-tunnel", "state");
const statePath = path.join(stateRoot, "subagent-spawn-spacing.json");
const lockPath = `${statePath}.lock`;

async function read() {
	await acquireLock();
	try {
		return readUnlocked();
	} finally {
		releaseLock();
	}
}

async function write(value) {
	await acquireLock();
	try {
		writeUnlocked(value);
	} finally {
		releaseLock();
	}
}

async function acquireLock() {
	fs.mkdirSync(stateRoot, { recursive: true });
	const deadline = Date.now() + 30 * 60 * 1000;
	while (Date.now() < deadline) {
		try {
			fs.mkdirSync(lockPath);
			return;
		} catch (error) {
			if (error.code !== "EEXIST") {
				throw error;
			}
			removeStaleLock();
			await delay(200);
		}
	}
	throw codedError("subagent_spawn_spacing_lock_timeout");
}

function removeStaleLock() {
	try {
		const ageMs = Date.now() - fs.statSync(lockPath).mtimeMs;
		if (ageMs > 2 * 60 * 1000) {
			fs.rmSync(lockPath, { recursive: true, force: true });
		}
	} catch (_error) {}
}

function releaseLock() {
	try {
		fs.rmSync(lockPath, { recursive: true, force: true });
	} catch (_error) {}
}

function readUnlocked() {
	try {
		return JSON.parse(fs.readFileSync(statePath, "utf8"));
	} catch (_error) {
		return {};
	}
}

function writeUnlocked(value) {
	const temporary = `${statePath}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}
`, "utf8");
	fs.renameSync(temporary, statePath);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	read,
	statePath,
	write
};
