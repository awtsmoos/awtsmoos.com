// B"H
import assert from "assert";
import { simulateRuntime } from "../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js";

const got = await simulateRuntime({
  runtime: "node",
  engine: "merkava",
  entry: "app.js",
  files: {
    "data.txt": "seed",
    "app.js": `
      const before = api.fs.readFileSync('data.txt');
      api.fs.writeFileSync('out.txt', before + '-grown');
      const child = api.child_process.spawn('echo', ['hi']);
      return { before, after: api.fs.readFileSync('out.txt'), child };
    `
  }
});

assert.equal(got.ok, true);
assert.equal(got.domSnapshot, undefined);
assert.equal(got.snapshot?.files?.["out.txt"] || got.result?.snapshot?.files?.["out.txt"], undefined);
assert(got.runtimeGraph.nodes.some(node => node.kind === "node"));

const fail = await simulateRuntime({ runtime: "node", engine: "merkava", entry: "bad.js", files: { "bad.js": "api.fs.readFileSync('missing.txt');" } });
assert.equal(fail.ok, false);
assert(/ENOENT|missing/i.test((fail.errors || []).map(e => e.message).join(" ")));
console.log("B'H merkava node device stress ok");
