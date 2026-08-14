// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./mailbox-paths.js");

/**
 * @file Moves caller-approved exact mailbox records into reversible quarantine testimony.
 * @description The Awtsmoos preserves one finite witness without pretending settlement;
 * Awtsmoos.com rechecks lane, identity, timestamp, and hash before custody may move.
 */
function plan(config, records, options = {}) {
	const requested = Array.isArray(records) ? records : [];
	const seen = new Set();
	const items = requested.map(record => {
		const key = `${record.lane}:${record.id}`;
		if (seen.has(key)) throw new Error("mailbox_record_duplicate_plan");
		seen.add(key);
		return describe(config, record);
	});
	return {
		ok: true,
		plannedAt: new Date(Number(options.now || Date.now())).toISOString(),
		records: items
	};
}

function apply(config, approved, options = {}) {
	const records = Array.isArray(approved?.records) ? approved.records : [];
	const stamp = safeStamp(options.now || Date.now());
	const directory = path.join(Paths.root(config), "quarantine", "exact-records", stamp);
	fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	const manifest = path.join(directory, "manifest.json");
	const testimony = {
		version: 1,
		createdAt: new Date(Number(options.now || Date.now())).toISOString(),
		state: "planned",
		records: records.map(record => prepare(config, directory, record)),
		applied: []
	};
	writeManifest(manifest, testimony);
	for (const record of testimony.records) {
		moveRecord(record);
		testimony.applied.push(`${record.lane}:${record.id}`);
		writeManifest(manifest, testimony);
	}
	testimony.state = "applied";
	writeManifest(manifest, testimony);
	return { ok: true, directory, manifest, moved: testimony.applied.length };
}

function describe(config, record) {
	const lane = String(record?.lane || "");
	const id = String(record?.id || "");
	const updatedAt = String(record?.updatedAt || "");
	const source = Paths.file(config, lane, id);
	readExpected(source, id, updatedAt);
	return { lane, id, updatedAt, source, sha256: hash(source) };
}

function prepare(config, directory, approved) {
	const current = describe(config, approved);
	if (current.sha256 !== approved.sha256) throw new Error("mailbox_record_hash_changed");
	return {
		...current,
		target: path.join(directory, current.lane, path.basename(current.source))
	};
}

function moveRecord(record) {
	const current = readExpected(record.source, record.id, record.updatedAt);
	if (!current || hash(record.source) !== record.sha256) throw new Error("mailbox_record_hash_changed");
	fs.mkdirSync(path.dirname(record.target), { recursive: true, mode: 0o700 });
	fs.renameSync(record.source, record.target);
	try {
		assertHash(record.target, record.sha256);
	} catch (error) {
		try { fs.renameSync(record.target, record.source); } catch {}
		throw error;
	}
}

function readExpected(file, id, updatedAt) {
	const stat = fs.lstatSync(file);
	if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("mailbox_record_not_regular");
	const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
	if (String(parsed.id || "") !== id) throw new Error("mailbox_record_id_changed");
	if (String(parsed.updatedAt || "") !== updatedAt) throw new Error("mailbox_record_changed");
	return parsed;
}

function hash(file) {
	return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function assertHash(file, expected) {
	if (hash(file) !== expected) throw new Error("mailbox_record_hash_mismatch");
}

function writeManifest(file, value) {
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
	fs.chmodSync(file, 0o600);
}

function safeStamp(value) {
	return `${new Date(Number(value)).toISOString().replace(/[^0-9A-Z]/gi, "-")}-${process.pid}`;
}

module.exports = { apply, hash, plan };
