// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const ProjectRoot = require("../tools/fs/mission/autoContinuation/projectRoot.js");

/**
 * @file Proves current same-mission project binding outranks an old still-existing checkout.
 * @description
 * The Awtsmoos may leave yesterday's repository standing while today's deed has moved;
 * Awtsmoos.com therefore trusts an explicit living binding for the same mission first, yet
 * rejects an unrelated mission's binding so recovery never jumps into another project's flame.
 */
function repositories() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root-binding-"));
	const oldRoot = path.join(root, "old-repo");
	const liveRoot = path.join(root, "live-repo");
	for (const target of [oldRoot, liveRoot]) {
		fs.mkdirSync(path.join(target, ".git"), { recursive: true });
	}
	return { root, oldRoot: fs.realpathSync(oldRoot), liveRoot: fs.realpathSync(liveRoot) };
}

test("same-mission live binding wins over historical repository", () => {
	const value = repositories();
	try {
		const mission = { id: "mission-current" };
		const lock = { missionId: mission.id, projectRoot: value.oldRoot };
		const binding = { missionId: mission.id, projectRoot: value.liveRoot };
		assert.equal(ProjectRoot.resolve({ root: value.root }, mission, lock, binding), value.liveRoot);
	} finally {
		fs.rmSync(value.root, { recursive: true, force: true });
	}
});

test("binding from another mission cannot redirect continuation", () => {
	const value = repositories();
	try {
		const mission = { id: "mission-current" };
		const lock = { missionId: mission.id, projectRoot: value.oldRoot };
		const binding = { missionId: "different-mission", projectRoot: value.liveRoot };
		assert.equal(ProjectRoot.resolve({ root: value.root }, mission, lock, binding), value.oldRoot);
	} finally {
		fs.rmSync(value.root, { recursive: true, force: true });
	}
});
