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

  const generic = await dispatchOsFs(null, "test", { action: "envDoctor", p: "." });
  assert.equal(generic.ok, true);
  assert.equal(generic.result.type, "documented-action-report");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
