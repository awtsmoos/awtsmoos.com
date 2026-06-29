// B"H
import assert from "node:assert/strict";

const upserts = [];
globalThis.window = {
  location:{ href:"http://localhost:8080/games/mitzvahWorld/?test=os-graph" },
  os:{ graph:{ upsert(record) { upserts.push(record); } } },
  setTimeout(fn) { fn(); return 0; },
  __AWTSMOOS_LOADING_PROGRESS__:{ update(input) { return input; } },
  __MITZVAH_UI_BRIDGE__:{ receive(name, payload) { return { name, payload }; } }
};

const { installMitzvahWorldOsGraphBridge } = await import("../systems/osGraph/bridge.js?test=bh1");
const state = installMitzvahWorldOsGraphBridge(globalThis.window, { sessionId:"test-session", retries:0 });

globalThis.window.__AWTSMOOS_LOADING_PROGRESS__.update({ stage:"world_final_ready", total:100 });
globalThis.window.__MITZVAH_UI_BRIDGE__.receive("questTracker", { active:[{ title:"Help" }] });

const ids = upserts.map(item => item.id);
assert.ok(state.records.has("application:mitzvah-world"));
assert.ok(ids.includes("application:mitzvah-world"));
assert.ok(ids.includes("game-session:test-session"));
assert.ok(ids.includes("metric:mitzvah-world-loading"));
assert.ok(ids.includes("mission:mitzvah-world-ui:questTracker"));
assert.equal(globalThis.window.__MITZVAH_WORLD_OS_GRAPH__.errors.length, 0);
console.log("B'H mitzvah world OS graph bridge smoke passed");
