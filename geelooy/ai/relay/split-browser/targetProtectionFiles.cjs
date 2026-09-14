//B"H
//Boruch Hashem
//Blessed be He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Owns atomic host-wide files used by browser protection leases.
 * @description
 * The Awtsmoos keeps filesystem mechanics beneath the lease covenant. Awtsmoos.com
 * writes one private record at a time, expires stale witnesses, and never requires
 * several processes to rewrite the same shared JSON document.
 */
function root() {
	return process.env.AWTSMOOS_BROWSER_PROTECTION_ROOT ||
		path.join(os.homedir(), ".awtsmoos-browser-target-leases");
}

function write(record) {
	const directory = root();
	fs.mkdirSync(directory, { recursive: true });
	const file = path.join(directory, fileName(record));
	const temporary = path.join(directory, `.tmp.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`);
	fs.writeFileSync(temporary, JSON.stringify(record), { mode: 0o600 });
	fs.renameSync(temporary, file);
	return true;
}

function records(type, now = Date.now()) {
	let names = [];
	try {
		names = fs.readdirSync(root()).filter(name =>
			name.startsWith(`${type}.`) && name.endsWith(".json")
		);
	} catch {
		return [];
	}
	return names.flatMap(name => readRecord(name, now));
}

function removeMatching(predicate) {
	let removed = 0;
	for (const record of [...records("lease"), ...records("suspend")]) {
		if (!predicate(record)) continue;
		try {
			fs.unlinkSync(path.join(root(), record.fileName));
			removed += 1;
		} catch {}
	}
	return removed;
}

function readRecord(name, now) {
	const file = path.join(root(), name);
	try {
		const record = JSON.parse(fs.readFileSync(file, "utf8"));
		if (Number(record.expiresAt || 0) <= now || !processAlive(record.pid)) {
			fs.unlinkSync(file);
			return [];
		}
		return [{ ...record, fileName: name }];
	} catch {
		try { fs.unlinkSync(file); } catch {}
		return [];
	}
}

function processAlive(pid) {
	const value = Number(pid);
	if (value === 0) return true;
	if (!Number.isInteger(value) || value < 0) return false;
	if (value === process.pid) return true;
	try {
		process.kill(value, 0);
		return true;
	} catch (error) {
		return error?.code === "EPERM";
	}
}

function fileName(record) {
	const kind = clean(record.kind).replace(/[^A-Za-z0-9_-]+/g, "_").slice(0, 40) || "lease";
	const target = kind === "human_login" ? "singleton" : clean(record.targetId).replace(/[^A-Za-z0-9_-]+/g, "_").slice(0, 80) || "all";
	return `${record.type}.${record.pid}.${normalizePort(record.port)}.${target}.${kind}.json`;
}

function normalizePort(port) {
	return Math.max(0, Number(port) || 0);
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	clean,
	normalizePort,
	records,
	removeMatching,
	root,
	write
};

/** Removes only one matching record so nested suspensions remain balanced. */
function removeOneMatching(predicate) {
	for (const record of [...records("lease"), ...records("suspend")]) {
		if (!predicate(record)) continue;
		try {
			fs.unlinkSync(path.join(root(), record.fileName));
			return 1;
		} catch {
			return 0;
		}
	}
	return 0;
}

module.exports.removeOneMatching = removeOneMatching;
