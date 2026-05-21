// B"H
import assert from "assert";
import { simulateRuntime } from "../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js";

async function main() {
  const got = await simulateRuntime({
    runtime: "browser",
    engine: "merkava",
    entry: "index.html",
    files: { "index.html": "<button id='ok'>ok</button>" },
    interactions: [{ op: "click", selector: "#missing" }]
  });
  assert.equal(got.ok, false);
  assert(/missing|selector|No element/i.test(JSON.stringify(got.errors || got.stackTraces || got)));

  const badOp = await simulateRuntime({
    runtime: "browser",
    engine: "merkava",
    entry: "index.html",
    files: { "index.html": "<button id='ok'>ok</button>" },
    interactions: [{ op: "teleport", selector: "#ok" }]
  });
  assert.equal(badOp.ok, false);
  assert(/Unsupported interaction|teleport/i.test(JSON.stringify(badOp.errors || badOp.stackTraces || badOp)));
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
