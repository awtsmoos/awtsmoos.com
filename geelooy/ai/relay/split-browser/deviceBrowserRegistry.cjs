//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Owner = require("./debugChromeProfileOwner.cjs");
const SharedProfile = require("./sharedChromeProfile.cjs");

const SCHEMA_VERSION = 1;
const LOOPBACK_HOST = "127.0.0.1";

/**
 * @file Owns the one durable AI-browser identity for this physical device.
 * @description
 * The Awtsmoos separates durable browser identity from replaceable transport.
 * Every service reads this atomic record instead of guessing ports, localhost
 * families, or per-agent profiles. No cookie, page text, or credential is stored.
 */
function observe(options = {}) {
	const profile = selectedProfile(options);
	const owner = Owner.ownedProfileOwner(profile, options);
	if (!owner) return unavailable(profile, read());
	return adopt({ ...owner, host: LOOPBACK_HOST, profile });
}

/** Returns the last atomically persisted device-browser testimony. */
function read(environment = process.env) {
	try {
		const value = JSON.parse(fs.readFileSync(statePath(environment), "utf8"));
		return validRecord(value) ? value : null;
	} catch {
		return null;
	}
}

/** Persists one observed owner and rotates incarnation only when the owner changes. */
function adopt(owner = {}, environment = process.env) {
	const previous = read(environment);
	const sameOwner = previous &&
		previous.pid === Number(owner.pid) &&
		previous.port === Number(owner.port) &&
		previous.profile === owner.profile &&
		previous.startedAt === Number(owner.startedAt || 0);
	const record = {
		schemaVersion: SCHEMA_VERSION,
		deviceKey: deviceKey(owner.profile),
		profile: owner.profile,
		host: LOOPBACK_HOST,
		port: Number(owner.port),
		pid: Number(owner.pid),
		startedAt: Number(owner.startedAt || 0),
		incarnationId: sameOwner ? previous.incarnationId : incarnation(owner),
		generation: sameOwner ? previous.generation : Number(previous?.generation || 0) + 1,
		updatedAt: Date.now()
	};
	write(record, environment);
	process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(record.port);
	return { ok: true, ...record };
}

/** Records a newly spawned owner after its actual DevTools port is known. */
function recordSpawn(owner = {}, environment = process.env) {
	return adopt({ ...owner, profile: owner.profile || selectedProfile({ environment }) }, environment);
}

/** Returns the selected profile, preferring durable device testimony over defaults. */
function selectedProfile(options = {}) {
	const environment = options.environment || process.env;
	const explicit = String(options.profile || "").trim();
	if (explicit) return path.resolve(explicit);
	const remembered = read(environment)?.profile;
	return remembered ? path.resolve(remembered) : SharedProfile.profilePath(environment);
}

/** Writes through a private temporary file so readers never observe partial JSON. */
function write(record, environment = process.env) {
	const file = statePath(environment);
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(record, null, 2), { mode: 0o600 });
	fs.renameSync(temporary, file);
	try { fs.chmodSync(file, 0o600); } catch {}
}

/** Returns a device-local state path, overridable for isolated tests. */
function statePath(environment = process.env) {
	if (environment.AWTSMOOS_AI_BROWSER_STATE) return path.resolve(environment.AWTSMOOS_AI_BROWSER_STATE);
	const home = environment.USERPROFILE || environment.HOME || os.homedir();
	return path.join(home, ".awtsmoos-ai-browser", "device-browser.json");
}

function deviceKey(profile) {
	return crypto.createHash("sha256").update(`${os.hostname()}\n${profile}`).digest("hex").slice(0, 24);
}

function incarnation(owner) {
	const text = `${deviceKey(owner.profile)}|${owner.pid}|${owner.port}|${owner.startedAt || 0}`;
	return crypto.createHash("sha256").update(text).digest("hex").slice(0, 24);
}

function validRecord(value) {
	return value?.schemaVersion === SCHEMA_VERSION &&
		value.host === LOOPBACK_HOST &&
		Number.isInteger(value.port) && value.port > 0 &&
		Number.isInteger(value.pid) && value.pid > 0 &&
		Boolean(value.profile && value.incarnationId);
}

function unavailable(profile, previous) {
	return { ok: false, status: "device_ai_browser_offline", profile, previous };
}

module.exports = { LOOPBACK_HOST, adopt, observe, read, recordSpawn, selectedProfile, statePath };
