// B"H
const assert = require("assert");
const { dispatchOsFs } = require("../../geelooy/API/tunnel/control/routes/osFs/index.js");

async function main() {
  const out = await dispatchOsFs(null, "test", {
    action: "commandTreeDryRun",
    steps: [{ action: "stat", payload: { path: "." } }]
  });
  assert.equal(out.ok, true);
  assert.equal(out.action, "commandTreeDryRun");
  assert.equal(out.count, 1);

  const support = await dispatchOsFs(null, "test", { action: "envDoctor", p: "." });
  assert.equal(support.ok, true);
  assert.equal(support.resultType, "support-action-result");
  assert.equal(support.family, "diagnostic");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
