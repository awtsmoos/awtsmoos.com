// B"H
const assert = require("assert");
const { buildActions } = require("../../fs/actions.js");
const { buildToolCatalog } = require("../../../lib/tool-schema-catalog.js");
const config = { root:process.cwd(), allowWrite:true, allowCommands:true, allowSecrets:false, tools:{ chrome:true, fsRead:true, fsWrite:true, fsBulk:true, fsList:true, fsTree:true }, chrome:{ enabled:true, port:9223 } };
const actions = buildActions(config, { action:"chatgptSeasonSaveAndContinue" }, null);
for (const name of ["chatgptSeasonSaveAndContinue", "chatgptAutoPilotSession", "chatgptAutoContinueWhenIdle", "chatgptSaveCurrentSeason", "chatgptSessionConclusion"]) assert.equal(typeof actions[name], "function", name);
const names = Object.keys(actions).filter(n => n.startsWith("chatgpt"));
const catalog = buildToolCatalog({ config, fsActionNames:names, agentVersion:"test" });
assert.ok(catalog.names.includes("chatgptSeasonSaveAndContinue"));
assert.ok(catalog.yaml.includes("ChatGPT conversation URL"));
assert.ok(catalog.schemas.chatgptSeasonSaveAndContinue.properties.maxTurns);
assert.ok(catalog.tools.find(t => t.name === "chatgptAutoPilotSession").description.includes("wait"));
console.log(JSON.stringify({ ok:true, suite:"chatgpt-schema-actions", chatgptActions:names.length }, null, 2));
