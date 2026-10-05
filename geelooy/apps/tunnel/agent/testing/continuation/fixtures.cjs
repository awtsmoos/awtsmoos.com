// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-continuation-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(base, "isolated-runtime");
process.env.AWTSMOOS_HOME = base;
const root = path.resolve(__dirname, "../../tools/chatgpt/hourLoop");
const Actions = require(root + "/actions.js"), State = require(root + "/state.js"), Tick = require(root + "/tick.js");
function start(input = {}) {
	return Actions.start({ base, url: "https://chatgpt.com/g/test-gpt/c/fixture-one",
		goal: "Verify only this owned fixture", durationMs: 60000, ...input });
}
function live(text = "before", id = "fixture-one") {
	return { ok: true, href: "https://chatgpt.com/g/test-gpt/c/" + id, idle: true,
		promptFound: true, assistantTextPreview: text, lastUserText: "" };
}
module.exports = { base, root, Actions, State, Tick, start, live, fs, path };
