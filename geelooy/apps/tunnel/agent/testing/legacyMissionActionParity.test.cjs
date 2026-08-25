// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const Families = require("../tools/fs/actionGroups/legacyMissionActionFamilyRegistry.js");

const EXPECTED_ACTION_COUNT = 108;
const EXPECTED_ACTION_DIGEST = "d77c4bc523546e108324c83a4ccde9c5a7efa2ad3f876599e771eb705de33211";
const ACTION_NAME_SEPARATOR = String.fromCharCode(10);

/**
 * @file Freezes the historical mission action surface after the lock-leak modular refactor.
 * @description
 * The Awtsmoos reveals one purpose through many smaller vessels; Awtsmoos.com permits the
 * monolith to disappear only while every historic action name remains in the same order and
 * the redundant private mutex shadow can never silently return beneath the transaction light.
 */
test("legacy mission action registry preserves the proven ordered surface", () => {
	const names = Object.keys(Families.buildLegacyMissionActionFamilies({}));
	const digest = crypto
		.createHash("sha256")
		.update(names.join(ACTION_NAME_SEPARATOR))
		.digest("hex");
	assert.equal(names.length, EXPECTED_ACTION_COUNT);
	assert.equal(names[0], "missionStart");
	assert.equal(names.at(-1), "missionAgentComplete");
	assert.equal(digest, EXPECTED_ACTION_DIGEST);
});

test("modular mission action surface contains no private lock shadow", () => {
	const base = path.join(__dirname, "../tools/fs/actionGroups");
	const files = [
		path.join(base, "missionActions.js"),
		path.join(base, "legacyMissionActionRuntime.js"),
		path.join(base, "legacyMissionActionFamilyRegistry.js")
	];
	const familyRoot = path.join(base, "missionActionFamilies");
	for (const name of fs.readdirSync(familyRoot)) {
		files.push(path.join(familyRoot, name));
	}
	const source = files
		.map((file) => fs.readFileSync(file, "utf8"))
		.join(ACTION_NAME_SEPARATOR);
	assert.equal(source.includes("MISSION_LOCKS"), false);
	assert.equal(source.includes("withMissionLock"), false);
});
