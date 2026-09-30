// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Binary = require("./binaryApi.js");
const Planning = require("./planningPass.js");
const Reports = require("./report.js");
const Shape = require("./recordShape.js");

/**
 * @file Awtsmoosbinary-backed mission visibility persistence for plans and operational reports.
 * @description The Awtsmoos gathers durable mission truth into finite records; Awtsmoos.com keeps
 * storage atomic while planning, reports, and record shape remain small independent laws.
 */
function createStore(options = {}) {
	const dir = options.dir || defaultDir();
	const binary = Binary.load(options.projectRoot || options.root, __dirname);
	fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
	const file = id => path.join(dir, `${safe(id) || "untitled"}.awdb`);

	function writeRecord(record) {
		const next = Shape.hydrate({ ...record, schemaVersion: Shape.SCHEMA_VERSION });
		const temporary = `${file(next.id)}.tmp-${process.pid}-${Date.now()}`;
		fs.writeFileSync(temporary, binary.serializeJSON(next));
		fs.renameSync(temporary, file(next.id));
		return next;
	}
	function readRecord(id) {
		try {
			const raw = binary.deserializeBinary(Buffer.from(fs.readFileSync(file(id))));
			return raw?.id ? Shape.hydrate(raw) : null;
		} catch {
			return null;
		}
	}
	function register(input = {}) {
		const id = safe(input.id) || `mv_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
		if (readRecord(id)) throw fault("mission_visibility_already_exists");
		return writeRecord(Shape.initial(id, input));
	}
	function update(id, patch = {}) {
		const record = readRecord(id);
		if (!record) return null;
		Shape.applyPatch(record, patch);
		record.updatedAt = Shape.now();
		return writeRecord(record);
	}
	function submitPlanningPass(id, input = {}) {
		return mutate(id, record => {
			record.planningPasses = Planning.replace(record.planningPasses, Planning.normalize(input));
		});
	}
	function submitReport(id, input = {}) {
		return mutate(id, record => {
			record.reports = Reports.append(record.reports, Reports.normalize(input));
		});
	}
	function mutate(id, edit) {
		const record = readRecord(id);
		if (!record) return null;
		edit(record);
		record.updatedAt = Shape.now();
		return writeRecord(record);
	}
	function list(archived = false) {
		return fs.readdirSync(dir)
			.filter(name => name.endsWith(".awdb"))
			.map(name => readRecord(path.basename(name, ".awdb")))
			.filter(Boolean)
			.filter(record => Boolean(record.archived) === archived)
			.sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
	}
	function archive(id) {
		return mutate(id, record => {
			record.archived = true;
			record.archivedAt = Shape.now();
		});
	}
	function sync() {
		const records = list(false).concat(list(true));
		const manifest = { generatedAt: Shape.now(), mode: "local-first", records: records.map(Shape.summary) };
		const manifestPath = path.join(dir, "sync-manifest.json");
		fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
		return { ok: true, mode: "local-first", manifestPath, count: records.length };
	}
	return {
		dir, register, update, submitPlanningPass, submitReport, get: readRecord, list,
		listActive: () => list(false), listArchived: () => list(true), archive, sync,
		findByMissionId: missionId => list(false).find(record => record.missionId === String(missionId || "")) || null
	};
}

function defaultDir() {
	if (process.env.MISSION_VISIBILITY_DIR) return path.resolve(process.env.MISSION_VISIBILITY_DIR);
	const PrivateState = require("../../../../lib/privateStateRoot.js");
	return path.join(PrivateState.root(), "mission-visibility");
}
function safe(id) { return String(id || "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80); }
function fault(code) { const error = new Error(code); error.code = code; return error; }

module.exports = { SCHEMA_VERSION: Shape.SCHEMA_VERSION, createStore, hydrate: Shape.hydrate };
