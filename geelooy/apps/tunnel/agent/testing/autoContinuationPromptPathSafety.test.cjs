// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Prompt = require("../tools/fs/mission/autoContinuation/prompt.js");
const NEWLINE = String.fromCharCode(10);

/**
 * @file Proves verified present absolute paths survive while stale historical paths stay redacted.
 * @description
 * The Awtsmoos distinguishes the road alive now from yesterday's remembered coordinates;
 * Awtsmoos.com places the verified current root into the successor chat while continuing
 * to scrub arbitrary predecessor paths that were never revalidated beneath that living root.
 */
function projectFixture() {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awts prompt roots "));
	const live = path.join(base, "live repo with spaces");
	fs.mkdirSync(path.join(live, ".git"), { recursive: true });
	const handoff = path.join(live, "plans", "continue here.md");
	fs.mkdirSync(path.dirname(handoff), { recursive: true });
	fs.writeFileSync(handoff, ["Continue the living work.", ""].join(NEWLINE));
	return { base, live: fs.realpathSync(live), handoff: fs.realpathSync(handoff) };
}

test("fingerprint remains independent of checkout location", () => {
	const mission = { id: "mission-moved" };
	const first = {
		missionId: mission.id,
		projectRoot: "/Users/old/work/project",
		lastMustCallNext: { action: "continue", cwd: "/Users/old/work/project/src" }
	};
	const second = {
		missionId: mission.id,
		projectRoot: "/Users/new/work/project",
		lastMustCallNext: { action: "continue", cwd: "/Users/new/work/project/src" }
	};
	assert.equal(Prompt.fingerprint({}, mission, first), Prompt.fingerprint({}, mission, second));
});

test("fresh prompt preserves verified current paths but redacts stale evidence", () => {
	const value = projectFixture();
	try {
		const mission = { id: "mission-moved", room: { id: "room-one" } };
		const lock = {
			missionId: mission.id,
			projectRoot: "/Users/old/work/project",
			lastMustCallNext: { action: "continue", cwd: "/Users/old/work/project/src" }
		};
		const prompt = Prompt.build({}, mission, lock, undefined, {
			binding: { missionId: mission.id, projectRoot: value.live },
			handoffPaths: [value.handoff],
			recoveryCheckpoint: {
				goal: "Finish /Users/old/work/project",
				latestHandoff: { file: "/Users/old/work/project/geelooy/file.js" }
			}
		});
		assert.equal(prompt.includes(`verifiedAbsoluteProjectRoot: ${value.live}`), true);
		assert.equal(prompt.includes(value.handoff), true);
		assert.equal(prompt.includes("existing main branch only"), true);
		assert.equal(prompt.includes("/Users/old/work/project"), false);
		assert.equal(prompt.includes("[historical-path-redacted]"), true);
	} finally {
		fs.rmSync(value.base, { recursive: true, force: true });
	}
});
