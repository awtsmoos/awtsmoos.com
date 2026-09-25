// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test, beforeEach } = require("node:test");

process.env.MISSION_VISIBILITY_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "mv-test-"));
const { createStore } = require("../tools/fs/actionGroups/missionVisibility/store.js");
const { buildMissionVisibilityActions } = require("../tools/fs/actionGroups/missionVisibilityActions.js");

const DESCRIPTION = [
	"We are rebuilding the tunnel's mission surface so any agent sees everything instantly.",
	"",
	"WHY: agents used to scatter .ai-thoughts folders; nobody could see the whole board.",
	"",
	"Unicode check: B\"H \u05D1\"\u05D4 and newlines survive the Awtsmoosbinary round-trip."
].join("\n");

function act(name, payload = {}) {
	const actions = buildMissionVisibilityActions({ config: {}, payload: { action: name, ...payload } });
	return actions[name]();
}

let store;
beforeEach(() => { store = createStore({ dir: process.env.MISSION_VISIBILITY_DIR }); });

test("register stores a mission as Awtsmoosbinary and round-trips the description", async () => {
	const out = await act("missionVisibilityRegister", {
		title: "Visibility spike",
		description: DESCRIPTION,
		goals: ["instant board", "no .ai-thoughts"],
		agents: [{ id: "agent-a", role: "implementer" }],
		openQuestions: ["remote sync?"],
		relatedPaths: ["geelooy/apps/tunnel"]
	});
	assert.equal(out.ok, true);
	assert.ok(out.id);
	const files = fs.readdirSync(process.env.MISSION_VISIBILITY_DIR);
	assert.ok(files.some(f => f.endsWith(".awdb")), "record persisted as .awdb binary");
	const raw = fs.readFileSync(path.join(process.env.MISSION_VISIBILITY_DIR, files.find(f => f.endsWith(".awdb"))));
	assert.equal(raw.slice(0, 2).toString("utf8"), "Aj", "file carries the Awtsmoosbinary magic header, not a JSON text file");
	const got = await act("missionVisibilityGet", { id: out.id });
	assert.equal(got.ok, true);
	assert.equal(got.mission.description, DESCRIPTION, "description fidelity preserved");
	assert.deepEqual(got.mission.goals, ["instant board", "no .ai-thoughts"]);
});

test("update merges fields and list returns all active missions", async () => {
	const a = await act("missionVisibilityRegister", { title: "A", description: "da" });
	const b = await act("missionVisibilityRegister", { title: "B", description: "db" });
	const upd = await act("missionVisibilityUpdate", { id: a.id, progress: "halfway", status: "in-progress" });
	assert.equal(upd.ok, true);
	assert.equal(upd.mission.progress, "halfway");
	assert.equal(upd.mission.title, "A", "untouched fields survive");
	const list = await act("missionVisibilityList");
	assert.equal(list.ok, true);
	assert.ok(list.count >= 2);
	assert.ok(list.missions.every(m => m.description), "list carries full detailed descriptions");
	assert.ok(list.missions.some(m => m.id === b.id));
});

test("archive removes the mission from the active list", async () => {
	const a = await act("missionVisibilityRegister", { title: "Done thing", description: "dd" });
	const before = (await act("missionVisibilityList")).missions.map(m => m.id);
	assert.ok(before.includes(a.id));
	const arch = await act("missionVisibilityArchive", { id: a.id });
	assert.equal(arch.ok, true);
	assert.equal(arch.mission.archived, true);
	const after = (await act("missionVisibilityList")).missions.map(m => m.id);
	assert.ok(!after.includes(a.id));
	assert.equal(store.listArchived().filter(m => m.id === a.id).length, 1);
});

test("missing title/description and unknown ids fail cleanly", async () => {
	assert.equal((await act("missionVisibilityRegister", { description: "x" })).error, "title_required");
	assert.equal((await act("missionVisibilityRegister", { title: "x" })).error, "description_required");
	assert.equal((await act("missionVisibilityGet", { id: "nope" })).error, "mission_not_found");
	assert.equal((await act("missionVisibilityUpdate", { id: "nope" })).error, "mission_not_found");
	assert.equal((await act("missionVisibilityArchive", { id: "nope" })).error, "mission_not_found");
});

test("sync emits a local-first manifest (sync hook point)", async () => {
	await act("missionVisibilityRegister", { title: "S", description: "ds" });
	const manifest = store.sync();
	assert.equal(manifest.ok, true);
	assert.equal(manifest.mode, "local-first");
	assert.ok(fs.existsSync(manifest.manifestPath));
	const parsed = JSON.parse(fs.readFileSync(manifest.manifestPath, "utf8"));
	assert.ok(Array.isArray(parsed.records) && parsed.records.length >= 1);
});
