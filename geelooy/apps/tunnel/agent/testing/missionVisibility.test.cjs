// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { beforeEach, test } = require("node:test");
const PROJECT_ROOT = path.resolve(__dirname, "../../../../../");
process.env.MISSION_VISIBILITY_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "mv-test-"));
const { createStore } = require("../tools/fs/actionGroups/missionVisibility/store.js");
const { buildMissionVisibilityActions } = require("../tools/fs/actionGroups/missionVisibilityActions.js");

/**
 * @file Proves tunnel-visible mission records and exactly three bounded planning passes.
 * @description The Awtsmoos makes coordination portable across installed runtimes: tests use the
 * explicit project root that the live tunnel supplies, then prove binary durability and pass truth.
 */
function act(name, payload = {}) {
	const actions = buildMissionVisibilityActions({
		config: { root: PROJECT_ROOT },
		payload: { action: name, ...payload }
	});
	return actions[name]();
}
function register(extra = {}) {
	return act("missionVisibilityRegister", {
		title: "Visible mission",
		description: "Three-pass operational planning belongs in the tunnel.",
		missionId: "mission-canonical-1",
		...extra
	});
}
let store;
beforeEach(() => {
	for (const file of fs.readdirSync(process.env.MISSION_VISIBILITY_DIR)) fs.rmSync(path.join(process.env.MISSION_VISIBILITY_DIR, file), { force: true });
	store = createStore({ dir: process.env.MISSION_VISIBILITY_DIR, projectRoot: PROJECT_ROOT });
});

test("register writes Awtsmoosbinary through explicit project-root resolution", async () => {
	const out = await register({ goals: ["visible plans", "live messaging"] });
	assert.equal(out.ok, true);
	assert.equal(out.mission.schemaVersion, 2);
	assert.equal(out.mission.missionId, "mission-canonical-1");
	assert.deepEqual(out.mission.planningProgress, { completed: 0, required: 3, complete: false });
	const file = fs.readdirSync(process.env.MISSION_VISIBILITY_DIR).find(name => name.endsWith(".awdb"));
	assert.equal(fs.readFileSync(path.join(process.env.MISSION_VISIBILITY_DIR, file)).subarray(0, 2).toString("utf8"), "Aj");
	assert.equal(store.findByMissionId("mission-canonical-1")?.id, out.id);
});

test("planning passes one through three complete and replace by slot", async () => {
	const created = await register();
	for (const pass of [1, 2, 3]) {
		const out = await act("missionVisibilityPlanningPass", {
			id: created.id, pass, title: `Pass ${pass}`, summary: `Summary ${pass}`,
			content: `Operational plan ${pass}`, sourcePaths: [`plan-${pass}.md`]
		});
		assert.equal(out.ok, true);
		assert.equal(out.planningProgress.completed, pass);
	}
	const complete = await act("missionVisibilityGet", { missionId: "mission-canonical-1" });
	assert.equal(complete.mission.planningProgress.complete, true);
	assert.deepEqual(complete.mission.planningPasses.map(item => item.pass), [1, 2, 3]);
	await act("missionVisibilityPlanningPass", { id: created.id, pass: 2, content: "Revised pass two" });
	const revised = await act("missionVisibilityGet", { id: created.id });
	assert.equal(revised.mission.planningPasses.length, 3);
	assert.equal(revised.mission.planningPasses[1].content, "Revised pass two");
});

test("planning action validates slot and content", async () => {
	const created = await register();
	assert.equal((await act("missionVisibilityPlanningPass", { id: created.id, pass: 4, content: "x" })).error, "planning_pass_must_be_1_2_or_3");
	assert.equal((await act("missionVisibilityPlanningPass", { id: created.id, pass: 1 })).error, "planning_pass_content_required");
	assert.equal((await act("missionVisibilityPlanningPass", { missionId: "missing", pass: 1, content: "x" })).error, "mission_not_found");
});

test("update, list, archive, and sync preserve active mission semantics", async () => {
	const a = await register({ id: "a", missionId: "m-a" });
	const b = await register({ id: "b", missionId: "m-b", title: "Second" });
	const update = await act("missionVisibilityUpdate", { id: a.id, progress: "halfway", status: "in-progress" });
	assert.equal(update.mission.progress, "halfway");
	const list = await act("missionVisibilityList");
	assert.ok(list.missions.some(item => item.id === b.id));
	assert.equal((await act("missionVisibilityArchive", { id: b.id })).mission.archived, true);
	assert.equal((await act("missionVisibilityList")).missions.some(item => item.id === b.id), false);
	const synced = store.sync();
	assert.equal(synced.ok, true);
	assert.ok(fs.existsSync(synced.manifestPath));
});

test("register and unknown identifiers fail cleanly", async () => {
	assert.equal((await act("missionVisibilityRegister", { description: "x" })).error, "title_required");
	assert.equal((await act("missionVisibilityRegister", { title: "x" })).error, "description_required");
	assert.equal((await act("missionVisibilityGet", { id: "nope" })).error, "mission_not_found");
	assert.equal((await act("missionVisibilityUpdate", { id: "nope" })).error, "mission_not_found");
});
