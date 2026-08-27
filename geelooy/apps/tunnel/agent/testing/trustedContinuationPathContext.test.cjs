// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Trusted = require("../tools/fs/mission/autoContinuation/trustedPathContext.js");
const NEWLINE = String.fromCharCode(10);

/**
 * @file Proves trusted continuation context cannot promote a path outside its verified root.
 * @description
 * The Awtsmoos contains every place without boundary; Awtsmoos.com nevertheless guards each
 * filesystem keli carefully, promoting only the current repository and files revalidated
 * beneath it while outside historical coordinates remain excluded from successor authority.
 */
test("trusted path context keeps live in-root files and rejects outside files", () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awts trusted context "));
	try {
		const root = path.join(base, "repo with spaces");
		fs.mkdirSync(path.join(root, ".git"), { recursive: true });
		const inside = path.join(root, "plans", "next step.md");
		const outside = path.join(base, "outside.md");
		fs.mkdirSync(path.dirname(inside), { recursive: true });
		fs.writeFileSync(inside, ["inside", ""].join(NEWLINE));
		fs.writeFileSync(outside, ["outside", ""].join(NEWLINE));
		const liveRoot = fs.realpathSync(root);
		const liveInside = fs.realpathSync(inside);
		const liveOutside = fs.realpathSync(outside);
		const context = Trusted.build(
			{},
			{ id: "mission-one" },
			{},
			{
				binding: { missionId: "mission-one", projectRoot: liveRoot },
				handoffPaths: [liveInside, liveOutside]
			}
		);
		assert.equal(context.precise, true);
		assert.equal(context.verifiedAbsoluteProjectRoot, liveRoot);
		assert.deepEqual(context.verifiedAbsoluteHandoffPaths, [liveInside]);
		assert.deepEqual(context.handoffReferences, ["project:plans/next step.md"]);
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
});
