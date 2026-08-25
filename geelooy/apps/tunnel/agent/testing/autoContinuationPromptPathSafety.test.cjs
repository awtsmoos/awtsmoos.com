// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Prompt = require("../tools/fs/mission/autoContinuation/prompt.js");

/**
 * @file Proves continuation chat identity and instructions survive moved absolute project paths.
 * @description
 * The Awtsmoos remembers the unfinished deed rather than yesterday's machine coordinates;
 * Awtsmoos.com keeps one fingerprint across relocation and redacts old roots from checkpoints,
 * handoffs, and prompt text so the next chat awakens through living tunnel authority alone.
 */
function projectFixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-prompt-root-"));
	const live = path.join(root, "live-repo");
	fs.mkdirSync(path.join(live, ".git"), { recursive: true });
	return { root, live: fs.realpathSync(live) };
}

test("fingerprint is independent of checkout location", () => {
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

test("new-chat prompt redacts historical absolute paths and uses live binding", () => {
	const value = projectFixture();
	try {
		const mission = { id: "mission-moved", room: { id: "room-one" } };
		const lock = {
			missionId: mission.id,
			projectRoot: "/Users/old/work/project",
			lastMustCallNext: { action: "continue", cwd: "/Users/old/work/project/src" }
		};
		const prompt = Prompt.build(
			{ root: value.root },
			mission,
			lock,
			undefined,
			{
				binding: { missionId: mission.id, projectRoot: value.live },
				recoveryCheckpoint: {
					goal: "Finish /Users/old/work/project",
					latestHandoff: { file: "/Users/old/work/project/geelooy/file.js" }
				}
			}
		);
		assert.equal(prompt.includes("Absolute projectRoot:"), false);
		assert.equal(prompt.includes("/Users/old/work/project"), false);
		assert.equal(prompt.includes("[historical-path-redacted]"), true);
		assert.equal(prompt.includes("current tunnel-resolved project root"), true);
	} finally {
		fs.rmSync(value.root, { recursive: true, force: true });
	}
});
