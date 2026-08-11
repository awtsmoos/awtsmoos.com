// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./mailbox-paths.js");

/**
 * @file Moves an already-approved legacy mailbox plan into reversible quarantine testimony.
 * @description The Awtsmoos moves two old witnesses together and records their hashes;
 * Awtsmoos.com never calls acknowledge or replay while preserving the path back from every migration.
 */
function apply(config, plan, options = {}) {
	const candidates = Array.isArray(plan?.candidates) ? plan.candidates : [];
	const stamp = safeStamp(options.now || Date.now());
	const directory = path.join(Paths.root(config), "quarantine", "legacy-pairs", stamp);
	fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	const manifest = path.join(directory, "manifest.json");
	const testimony = {
		version: 1,
		createdAt: new Date(Number(options.now || Date.now())).toISOString(),
		state: "planned",
		pairs: candidates.map(candidate => describe(config, directory, candidate)),
		applied: []
	};
	writeManifest(manifest, testimony);
	for (const pair of testimony.pairs) {
		movePair(pair);
		testimony.applied.push(pair.id);
		writeManifest(manifest, testimony);
	}
	testimony.state = "applied";
	writeManifest(manifest, testimony);
	return { ok: true, manifest, moved: testimony.applied.length, directory };
}

function describe(config, directory, candidate) {
	const inbox = Paths.file(config, "inbox", candidate.id);
	const outbox = Paths.file(config, "outbox", candidate.id);
	const inboxRecord = readExpected(inbox, candidate.id, candidate.inboxUpdatedAt);
	const outboxRecord = readExpected(outbox, candidate.id, candidate.outboxUpdatedAt);
	return {
		id: candidate.id,
		inbox: fileWitness(inbox, path.join(directory, "inbox", path.basename(inbox))),
		outbox: fileWitness(outbox, path.join(directory, "outbox", path.basename(outbox))),
		inboxUpdatedAt: inboxRecord.updatedAt,
		outboxUpdatedAt: outboxRecord.updatedAt
	};
}

function movePair(pair) {
	fs.mkdirSync(path.dirname(pair.inbox.target), { recursive: true, mode: 0o700 });
	fs.mkdirSync(path.dirname(pair.outbox.target), { recursive: true, mode: 0o700 });
	fs.renameSync(pair.inbox.source, pair.inbox.target);
	try {
		fs.renameSync(pair.outbox.source, pair.outbox.target);
	} catch (error) {
		fs.renameSync(pair.inbox.target, pair.inbox.source);
		throw error;
	}
	assertHash(pair.inbox.target, pair.inbox.sha256);
	assertHash(pair.outbox.target, pair.outbox.sha256);
}

function readExpected(file, id, updatedAt) {
	const stat = fs.lstatSync(file);
	if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("legacy_mailbox_pair_not_regular");
	const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
	if (String(parsed.id || "") !== String(id)) throw new Error("legacy_mailbox_pair_id_changed");
	if (String(parsed.updatedAt || "") !== String(updatedAt || "")) throw new Error("legacy_mailbox_pair_changed");
	return parsed;
}

function fileWitness(source, target) {
	return { source, target, sha256: hash(source) };
}

function hash(file) {
	return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function assertHash(file, expected) {
	if (hash(file) !== expected) throw new Error("legacy_mailbox_pair_hash_mismatch");
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

module.exports = { apply, describe, hash, movePair };
