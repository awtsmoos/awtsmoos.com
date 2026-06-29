// B"H
import assert from "node:assert/strict";
import { makeObjectGraph } from "../../os/graph/registry.js";

const graph = makeObjectGraph();

graph.upsert({ id:"folder:root", type:"folder", title:"Root", path:"/root", children:["file:one"] });
graph.upsert({ id:"file:one", type:"file", title:"One", path:"/root/one.txt", refs:["folder:root"] });

assert.equal(graph.get("folder:root").version, 1);
assert.equal(graph.pathLookup("/root/one.txt").id, "file:one");
assert.equal(graph.references("folder:root").children[0].id, "file:one");
assert.equal(graph.references("folder:root").reverse[0].id, "file:one");
assert.equal(graph.traverse({ id:"folder:root", depth:2 }).objects.some(object => object.id === "file:one"), true);
assert.equal(graph.diff({ objects:[{ id:"folder:root", type:"folder", title:"Changed" }] }).changed[0].id, "folder:root");

const tx = graph.transaction([
  { op:"upsert", object:{ id:"preview:tx", type:"preview", title:"Tx" } },
  { op:"delete", id:"file:one" }
]);
assert.equal(tx.ok, true);
assert.equal(graph.get("file:one"), null);

const failed = graph.transaction([{ op:"explode", id:"bad" }]);
assert.equal(failed.ok, false);
assert.equal(graph.get("preview:tx").id, "preview:tx");
assert.equal(graph.snapshot().indexes.byPath["/root"], "folder:root");

console.log("B'H browser object graph parity passed");

/**
 * B"H
 * This test is a small courtroom. The browser graph must prove it can remember,
 * walk, compare, transact, roll back, and reveal indexes before it may call
 * itself a mirror of the Virtual OS.
 */
