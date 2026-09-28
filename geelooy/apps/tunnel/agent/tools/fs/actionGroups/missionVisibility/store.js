// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Binary = require("./binaryApi.js");
const Planning = require("./planningPass.js");

/**
 * @file Awtsmoosbinary-backed mission visibility store, rooted in the active project.
 * @description The Awtsmoos gathers durable mission truth into finite records. Awtsmoos.com
 * keeps planning passes replaceable and bounded while Binary resolves repository storage law.
 */
const SCHEMA_VERSION = 2;
const RECORD_FIELDS = [
	"missionId", "title", "description", "goals", "status", "progress",
	"tasks", "agents", "decisions", "openQuestions", "relatedPaths"
];

function createStore(options = {}) {
	const dir = options.dir || defaultDir();
	const binary = Binary.load(options.projectRoot || options.root, __dirname);
	fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
	const file = id => path.join(dir, `${safe(id) || "untitled"}.awdb`);

	function writeRecord(record) {
		const next = hydrate({ ...record, schemaVersion: SCHEMA_VERSION });
		const tmp = `${file(next.id)}.tmp-${process.pid}-${Date.now()}`;
		fs.writeFileSync(tmp, binary.serializeJSON(next));
		fs.renameSync(tmp, file(next.id));
		return next;
	}
	function readRecord(id) {
		try {
			const raw = binary.deserializeBinary(Buffer.from(fs.readFileSync(file(id))));
			return raw?.id ? hydrate(raw) : null;
		} catch { return null; }
	}
	function register(input = {}) {
		const id = safe(input.id) || `mv_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
		if (readRecord(id)) throw fault("mission_visibility_already_exists");
		const stamp = now();
		return writeRecord({
			id, missionId: String(input.missionId || "").trim(), title: String(input.title || ""),
			description: String(input.description || ""), goals: listOf(input.goals),
			status: String(input.status || "active"), progress: String(input.progress || ""),
			tasks: listOf(input.tasks), agents: listOf(input.agents), decisions: listOf(input.decisions),
			openQuestions: listOf(input.openQuestions), relatedPaths: listOf(input.relatedPaths),
			planningPasses: [], createdAt: stamp, updatedAt: stamp, archived: false, archivedAt: null
		});
	}
	function update(id, patch = {}) {
		const record = readRecord(id);
		if (!record) return null;
		for (const key of RECORD_FIELDS) if (patch[key] !== undefined) record[key] = patch[key];
		record.updatedAt = now();
		return writeRecord(record);
	}
	function submitPlanningPass(id, input = {}) {
		const record = readRecord(id);
		if (!record) return null;
		record.planningPasses = Planning.replace(record.planningPasses, Planning.normalize(input));
		record.updatedAt = now();
		return writeRecord(record);
	}
	function list(archived = false) {
		return fs.readdirSync(dir).filter(name => name.endsWith(".awdb"))
			.map(name => readRecord(path.basename(name, ".awdb"))).filter(Boolean)
			.filter(record => Boolean(record.archived) === archived)
			.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
	}
	function archive(id) {
		const record = readRecord(id);
		if (!record) return null;
		record.archived = true;
		record.archivedAt = now();
		record.updatedAt = now();
		return writeRecord(record);
	}
	function sync() {
		const records = list(false).concat(list(true));
		const manifest = { generatedAt: now(), mode: "local-first", records: records.map(summary) };
		const manifestPath = path.join(dir, "sync-manifest.json");
		fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
		return { ok: true, mode: "local-first", manifestPath, count: records.length };
	}
	return {
		dir, register, update, submitPlanningPass, get: readRecord, list,
		listActive: () => list(false), listArchived: () => list(true), archive, sync,
		findByMissionId: missionId => list(false).find(record => record.missionId === String(missionId || "")) || null
	};
}

function hydrate(record) {
	const planningPasses = Array.isArray(record.planningPasses) ? record.planningPasses : [];
	return { ...record, schemaVersion: SCHEMA_VERSION, missionId: String(record.missionId || ""), planningPasses, planningProgress: Planning.progress(planningPasses) };
}
function defaultDir() {
	if (process.env.MISSION_VISIBILITY_DIR) return path.resolve(process.env.MISSION_VISIBILITY_DIR);
	const PrivateState = require("../../../../lib/privateStateRoot.js");
	return path.join(PrivateState.root(), "mission-visibility");
}
function summary(record) { return { id: record.id, missionId: record.missionId, title: record.title, updatedAt: record.updatedAt, archived: record.archived, planningProgress: record.planningProgress }; }
function safe(id) { return String(id || "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80); }
function now() { return new Date().toISOString(); }
function listOf(value) { return Array.isArray(value) ? value : []; }
function fault(code) { const error = new Error(code); error.code = code; return error; }

module.exports = { SCHEMA_VERSION, createStore, hydrate };
