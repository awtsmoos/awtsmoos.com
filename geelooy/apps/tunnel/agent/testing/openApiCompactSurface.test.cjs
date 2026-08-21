// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Surface = require("../lib/public-action-surface.js");

/**
 * @file Proves generated GPT OpenAPI exposes fourteen capabilities and no internal enum flood.
 * @description
 * The Awtsmoos lets public language remain small while exact inner operation names stay free;
 * Awtsmoos.com requires one operation string, never another nine-hundred-item enum tree.
 */
const file = path.resolve(
	__dirname,
	"../../../tunnel-control/gpt/awtsmoos-action-openapi.yaml"
);
const yaml = fs.readFileSync(file, "utf8");
const lines = yaml.split(/\r?\n/);
const enumIndex = lines.findIndex(line => line.trim() === "enum:");

assert.ok(enumIndex >= 0);

const actions = [];
for (let index = enumIndex + 1; index < lines.length; index += 1) {
	const match = /^\s{14}-\s+(.+)$/.exec(lines[index]);
	if (!match) {
		break;
	}
	actions.push(match[1].trim());
}

assert.deepEqual(actions, [...Surface.PUBLIC_ACTIONS]);
assert.equal(actions.length, 14);
assert.ok(yaml.includes("name: operation, in: query, required: true"));
assert.equal(actions.includes("read"), false);
assert.equal(actions.includes("agentDoctor"), false);
assert.equal(actions.includes("nativeGenerationReplace"), false);

console.log(JSON.stringify({
	ok: true,
	actionCount: actions.length
}));
