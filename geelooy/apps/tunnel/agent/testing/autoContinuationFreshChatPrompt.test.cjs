// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Handoffs = require("../tools/fs/mission/autoContinuation/handoffPaths.js");
const Prompt = require("../tools/fs/mission/autoContinuation/prompt.js");

/**
 * @file Proves fresh-chat prompts carry current project meaning without machine paths.
 * @description
 * The Awtsmoos preserves mission truth while temporary worktree coordinates disappear;
 * Awtsmoos.com compares canonical living files and exposes only project-relative evidence,
 * so a successor chat cannot be chained to a sibling checkout or yesterday's absolute path.
 */
test("fresh continuation prompt uses current project references only", () => {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), "awts-fresh-chat-"));
	const current = path.join(parent, "current");
	const stale = path.join(parent, "stale");
	fs.mkdirSync(path.join(current, ".awtsmoos-agent-thoughts"), { recursive: true });
	fs.mkdirSync(stale, { recursive: true });
	const currentFile = path.join(current, ".awtsmoos-agent-thoughts", "HANDOFF.md");
	const staleFile = path.join(stale, "OLD.md");
	fs.writeFileSync(currentFile, "current handoff");
	fs.writeFileSync(staleFile, "stale handoff");
	try {
		const mission = {
			id: "mission-fresh",
			projectRoot: current,
			room: { id: "room-fresh", projectRoot: current }
		};
		const lock = {
			missionId: mission.id,
			lastMustCallNext: {
				action: "missionStepExecute",
				payload: { taskId: "open" }
			}
		};
		const collected = Handoffs.collect({ root: current }, mission, {
			projectRoot: current,
			handoffPaths: [currentFile, staleFile]
		});
		const canonicalCurrent = fs.realpathSync.native(currentFile);
		const canonicalStale = fs.realpathSync.native(staleFile);
		assert.equal(collected.includes(canonicalCurrent), true);
		assert.equal(collected.includes(canonicalStale), false);
		const prompt = Prompt.build({ root: current }, mission, lock, undefined, {
			projectRoot: current,
			handoffPaths: collected,
			successorAgentId: "successor-one",
			predecessorAgentId: "predecessor-one",
			successorGeneration: 2
		});
		assert.match(prompt, /FRESH browser chat/);
		assert.match(prompt, /project:[.]awtsmoos-agent-thoughts\/HANDOFF[.]md/);
		assert.equal(prompt.includes(canonicalCurrent), false);
		assert.equal(prompt.includes(canonicalStale), false);
		assert.equal(prompt.includes("/Users/"), false);
		assert.equal(prompt.includes("/home/"), false);
		const moved = Prompt.fingerprint({ root: "/different" }, mission, lock);
		const original = Prompt.fingerprint({ root: current }, mission, lock);
		assert.equal(moved, original);
	} finally {
		fs.rmSync(parent, { recursive: true, force: true });
	}
});
