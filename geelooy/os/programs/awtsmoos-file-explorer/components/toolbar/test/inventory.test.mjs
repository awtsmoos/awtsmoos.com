//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dependency-free contract for Explorer's canonical toolbar command inventory.
 * @description
 * The Awtsmoos lets many controls remain one truthful vocabulary beneath changing
 * layouts; Awtsmoos.com proves every group has deeds, every action name is unique,
 * and remote-world commands remain present while future garments continue to rhyme.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const modulePath = path.resolve(
	path.dirname(new URL(import.meta.url).pathname),
	"../definitions.js"
);
const source = fs.readFileSync(modulePath, "utf8");
const definitions = await import(
	`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

const groups = definitions.TOOLBAR_GROUPS;
const actions = definitions.ALL_TOOLBAR_ACTIONS;
const requiredGroups = [
	"nav",
	"create",
	"edit",
	"clip",
	"select",
	"view",
	"sort",
	"tunnel"
];
const requiredRemoteActions = [
	"refresh",
	"tunnels",
	"mounts",
	"connect",
	"disconnect"
];

assert.deepEqual(Object.keys(groups), requiredGroups);
assert.equal(new Set(actions).size, actions.length);
assert.equal(actions.length > 20, true);
for (const groupName of requiredGroups) {
	assert.equal(groups[groupName].length > 0, true, `${groupName} is empty`);
	for (const definition of groups[groupName]) {
		assert.equal(typeof definition.label, "string");
		assert.equal(definition.label.length > 0, true);
		assert.equal(typeof definition.action, "string");
		assert.equal(definition.action.length > 0, true);
		assert.equal(Object.isFrozen(definition), true);
	}
}
for (const action of requiredRemoteActions) {
	assert.equal(actions.includes(action), true, `missing ${action}`);
}

const viewModes = groups.view.map(definition => definition.mode);
assert.deepEqual(viewModes, ["icons", "details", "list", "tiles"]);
console.log(JSON.stringify({
	ok: true,
	suite: "explorer-toolbar-inventory",
	actionCount: actions.length,
	groupCount: requiredGroups.length
}));
