// B"H
const assert = require("assert");
const { buildRenderLabActions, optionsFromPayload } = require("../actionGroups/renderLabActions.js");

const html = '<!doctype html><body><main><h1>B"H Native Lab</h1></main></body>';
const opts = optionsFromPayload({ html, modes: '["merkava"]', width: 320, height: 180 });
assert.strictEqual(opts.files["index.html"], html);

(async () => {
  const actions = buildRenderLabActions({ payload: { html, modes: '["merkava"]', width: 320, height: 180 } });
  const got = await actions.domDomRenderLab();
  assert.strictEqual(got.ok, true);
  assert.strictEqual(got.action, "domDomRenderLab");
  assert(got.reportHtml.includes("Render Lab"));
  console.log("BHY native render lab actions tests passed");
})().catch(error => { console.error(error); process.exit(1); });
