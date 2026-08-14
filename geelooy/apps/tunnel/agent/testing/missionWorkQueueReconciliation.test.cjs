// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const FromGoal = require("../tools/fs/mission/workQueue/fromGoal.js");
const Work = require("../tools/fs/mission/workQueue/index.js");
const Reconcile = require("../tools/fs/mission/workQueue/reconcile.js");

/** Proves scope markers never become phantom file-write obligations. */
function scopeMarkersStayScopes() {
	const items = FromGoal.fromGoal("Inspect the project", { p: "." });
	assert.equal(items.some(item => item.payload?.path === "."), false);
	const targeted = FromGoal.fromGoal("Repair geelooy/apps/tunnel/agent/main.js");
	assert.deepEqual(
		targeted.filter(item => item.payload?.path).map(item => item.kind),
		["write"]
	);
}

/** Proves current work and retired history remain distinct and truthful. */
function retiredHistoryCannotDriveWork() {
	const time = "2026-08-14T00:00:00.000Z";
	const existing = [
		item("write:a.js", "done"),
		item("write:b.js", "in_progress"),
		item("write:c.js", "obsolete")
	];
	const generated = [
		item("write:a.js", "pending"),
		item("write:c.js", "pending")
	];
	const merged = Reconcile.merge(existing, generated, time);
	assert.equal(find(merged, "write:a.js").status, "done");
	assert.equal(find(merged, "write:a.js").current, true);
	assert.equal(find(merged, "write:b.js").status, "obsolete");
	assert.equal(find(merged, "write:b.js").current, false);
	assert.equal(find(merged, "write:c.js").status, "pending");
	assert.equal(find(merged, "write:c.js").current, true);
}

/** Proves a changed goal retires old actions without fabricating completion. */
function refreshUsesOneActiveBoundary() {
	const mission = { id: "mission_queue", goal: "Repair src/a.js" };
	Work.refresh(mission);
	const oldWrite = mission.workQueue.items.find(item => item.key === "write:src/a.js");
	Work.applyStep(mission, { workKey: oldWrite.key }, { evidence: "verified" });
	mission.goal = "Repair src/b.js";
	Work.refresh(mission);
	const summary = Work.summary(mission);
	assert.equal(find(mission.workQueue.items, "write:src/a.js").current, false);
	assert.equal(find(mission.workQueue.items, "write:src/b.js").current, true);
	assert.equal(Work.available(mission).some(item => item.key === "write:src/a.js"), false);
	assert.equal(summary.historyTotal > summary.total, true);
	assert.equal(summary.retired > 0, true);
}

function item(key, status) {
	return {
		key,
		kind: "write",
		title: key,
		payload: { path: key.slice("write:".length) },
		status,
		createdAt: "2026-08-13T00:00:00.000Z"
	};
}

function find(items, key) {
	return items.find(item => item.key === key);
}

scopeMarkersStayScopes();
retiredHistoryCannotDriveWork();
refreshUsesOneActiveBoundary();
console.log(JSON.stringify({
	ok: true,
	suite: "mission-work-queue-reconciliation",
	scopeMarkersStayScopes: true,
	retiredHistoryCannotDriveWork: true,
	refreshUsesOneActiveBoundary: true
}));
