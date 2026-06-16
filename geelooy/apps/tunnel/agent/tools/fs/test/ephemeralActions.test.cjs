// B"H
const assert = require("assert");
const { buildEphemeralActions, cleanId } = require("../actionGroups/ephemeralActions.js");

const payload = { controlBaseUrl: "https://awtsmoos.com/api/tunnel/control/fs/native-one", resultRef: "awtsmoos://turn-result/res_abc", query: "needle", maxBytes: 123 };
const actions = buildEphemeralActions({ payload });

(async () => {
  assert.strictEqual(cleanId("awtsmoos://turn-result/res_abc"), "res_abc");
  const page = await actions.ephemeralPage();
  assert.strictEqual(page.resultId, "res_abc");
  assert(page.url.includes("/ephemeral/res_abc/page"));
  assert(page.url.includes("maxBytes=123"));
  const search = await actions.ephemeralSearch();
  assert(search.url.includes("query=needle"));
  const del = await actions.ephemeralDelete();
  assert(del.url.endsWith("/ephemeral/res_abc/delete"));
  console.log("BHY ephemeral actions tests passed");
})().catch(error => { console.error(error); process.exit(1); });
