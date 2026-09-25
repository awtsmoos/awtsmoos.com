// B"H
// Boruch Hashem
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/**
 * @file Awtsmoosbinary-backed mission visibility store (local-first).
 * @description Each mission record lives as one Awtsmoosbinary object
 * (ayzarim/DosDB awtsmoosBinaryJSON format) in `<dataDir>/<id>.awdb`.
 * Local-first: durable writes land on disk immediately; `sync()` emits a
 * JSON manifest that a remote uploader hook can consume (see MIGRATION.md).
 */
const SCHEMA_VERSION = 1;
const RECORD_FIELDS = ["title", "description", "goals", "status", "progress",
	"tasks", "agents", "decisions", "openQuestions", "relatedPaths"];

function repoRoot() {
	let dir = __dirname;
	for (let i = 0; i < 12; i += 1) {
		if (fs.existsSync(path.join(dir, "ayzarim", "DosDB", "awtsmoosBinary"))) return dir;
		dir = path.dirname(dir);
	}
	throw new Error("mission_visibility_repo_root_not_found");
}
let binaryApi = null;
function awtsmoosBinary() {
	if (!binaryApi) {
		binaryApi = require(path.join(repoRoot(), "ayzarim", "DosDB",
			"awtsmoosBinary", "awtsmoosBinaryJSON", "index.js"));
	}
	return binaryApi;
}
function defaultDir() {
	if (process.env.MISSION_VISIBILITY_DIR) return path.resolve(process.env.MISSION_VISIBILITY_DIR);
	const PrivateState = require("../../../../lib/privateStateRoot.js");
	return path.join(PrivateState.root(), "mission-visibility");
}
function safe(id) { return String(id || "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80); }
function now() { return new Date().toISOString(); }
function listOf(v) { return Array.isArray(v) ? v : []; }

function createStore(options = {}) {
	const dir = options.dir || defaultDir();
	fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
	const file = id => path.join(dir, `${safe(id) || "untitled"}.awdb`);

	function writeRecord(record) {
		const tmp = `${file(record.id)}.tmp-${process.pid}-${Date.now()}`;
		fs.writeFileSync(tmp, awtsmoosBinary().serializeJSON(record));
		fs.renameSync(tmp, file(record.id));
		return record;
	}
	function readRecord(id) {
		try {
			const record = awtsmoosBinary().deserializeBinary(Buffer.from(fs.readFileSync(file(id))));
			return record && record.id ? record : null;
		} catch { return null; }
	}
	function register(input = {}) {
		const id = safe(input.id) || `mv_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
		if (readRecord(id)) { const e = new Error("mission_visibility_already_exists"); e.code = "mission_visibility_already_exists"; throw e; }
		return writeRecord({
			schemaVersion: SCHEMA_VERSION, id,
			title: String(input.title || ""), description: String(input.description || ""),
			goals: listOf(input.goals), status: String(input.status || "active"),
			progress: String(input.progress || ""), tasks: listOf(input.tasks),
			agents: listOf(input.agents), decisions: listOf(input.decisions),
			openQuestions: listOf(input.openQuestions), relatedPaths: listOf(input.relatedPaths),
			createdAt: now(), updatedAt: now(), archived: false, archivedAt: null
		});
	}
	function update(id, patch = {}) {
		const record = readRecord(id);
		if (!record) return null;
		for (const key of RECORD_FIELDS) if (patch[key] !== undefined) record[key] = patch[key];
		record.updatedAt = now();
		return writeRecord(record);
	}
	function get(id) { return readRecord(id); }
	function list(archived = false) {
		return fs.readdirSync(dir).filter(f => f.endsWith(".awdb"))
			.map(f => readRecord(path.basename(f, ".awdb"))).filter(Boolean)
			.filter(r => Boolean(r.archived) === archived)
			.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
	}
	function archive(id) {
		const record = readRecord(id);
		if (!record) return null;
		record.archived = true; record.archivedAt = now(); record.updatedAt = now();
		return writeRecord(record);
	}
	// Local-first sync hook point: emits a manifest; a remote uploader
	// (env MISSION_VISIBILITY_SYNC_UPLOADER) can consume manifestPath.
	function sync() {
		const records = list(false).concat(list(true));
		const manifest = { generatedAt: now(), mode: "local-first",
			records: records.map(r => ({ id: r.id, title: r.title, updatedAt: r.updatedAt, archived: r.archived })) };
		const manifestPath = path.join(dir, "sync-manifest.json");
		fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
		return { ok: true, mode: "local-first", manifestPath, count: records.length,
			hook: "Point MISSION_VISIBILITY_SYNC_UPLOADER at a command that consumes manifestPath to push remote." };
	}
	return { dir, register, update, get, list, listActive: () => list(false), listArchived: () => list(true), archive, sync };
}

module.exports = { createStore, SCHEMA_VERSION };
