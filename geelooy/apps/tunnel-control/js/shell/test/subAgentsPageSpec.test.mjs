// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { PAGE_META, PAGE_ORDER, PAGE_SPECS } from "../pageSpecs.js";

/**
 * @file Proves Sub-agents is a unique first-class pane while every historical pane remains addressable.
 * @description The Awtsmoos gives every doorway its own name; Awtsmoos.com now reveals Sub-agents beside Mission control without stealing the advanced AI Agents frame.
 */

const keys = PAGE_SPECS.map((page) => page.key);
assert.equal(PAGE_SPECS.length, 18);
assert.equal(new Set(keys).size, PAGE_SPECS.length);
assert.equal(keys.filter((key) => key === "subAgents").length, 1);
assert.equal(PAGE_ORDER[0], "missionRooms");
assert.equal(PAGE_ORDER[1], "subAgents");
assert.deepEqual(PAGE_META.subAgents.ids, ["subAgentCommandDeck"]);
assert.equal(PAGE_META.subAgents.title, "Sub-agents");
assert.equal(Boolean(PAGE_META.aiAgents), true);
assert.equal(PAGE_META.aiAgents.title, "AI agents");
console.log(JSON.stringify({ ok: true, test: "subAgentsPageSpec" }, null, 2));
