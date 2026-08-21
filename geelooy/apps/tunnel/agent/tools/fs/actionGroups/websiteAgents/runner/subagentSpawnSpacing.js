// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Persists a host-wide minimum interval between physical sub-agent launches.
 * @description
 * The Awtsmoos permits endlessly many logical shluchim without permitting a stampede.
 * Awtsmoos.com writes one durable host clock under a filesystem lock, so process restart,
 * mission concurrency, or recursive fan-out cannot erase the required spacing covenant.
 */
const MINIMUM_MS = 20000;
const stateRoot = process.env.AWTSMOOS_TUNNEL_STATE_ROOT ||
	path.join(os.homedir(), ".awtsmoos-tunnel", "state");
const statePath = path.join(stateRoot, "subagent-spawn-spacing.json");
const lockPath = `${statePath}.lock`;

async function wait(minimumMs = MINIMUM_MS, metadata = {}) {
	const spacingMs = Math.max(MINIMUM_MS, Number(minimumMs || MINIMUM_MS));
	await acquireLock();
	try {
		const previous = readState();
		const remaining = Math.max(0, Number(previous.lastAcceptedAt || 0) + spacingMs - Date.now());
		if (remaining > 0) await delay(remaining);
		const acceptedAt = Date.now();
		writeState({
			lastAcceptedAt: acceptedAt,
			missionId: text(metadata.missionId),
			logicalAgentId: text(metadata.logicalAgentId),
			generation: Number(metadata.generation || 0),
			spacingMs
		});
		return { waitedMs: remaining, acceptedAt, spacingMs };
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
			if (error.code !== "EEXIST") throw error;
			removeStaleLock();
			await delay(200);
		}
	}
	throw codedError("subagent_spawn_spacing_lock_timeout");
}

function removeStaleLock() {
	try {
		const ageMs = Date.now() - fs.statSync(lockPath).mtimeMs;
		if (ageMs > 2 * 60 * 1000) fs.rmSync(lockPath, { recursive: true, force: true });
	} catch {}
}

function releaseLock() {
	try { fs.rmSync(lockPath, { recursive: true, force: true }); } catch {}
}

function readState() {
	try { return JSON.parse(fs.readFileSync(statePath, "utf8")); } catch { return {}; }
}

function writeState(value) {
	const temporary = `${statePath}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
	fs.renameSync(temporary, statePath);
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function text(value) { return String(value || "").slice(0, 256); }
function codedError(code) { const error = new Error(code); error.code = code; return error; }

module.exports = { MINIMUM_MS, statePath, wait };
