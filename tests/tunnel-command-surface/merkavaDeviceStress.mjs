// B"H
import assert from "assert";
import { simulateRuntime } from "../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js";

const html = `
<button id="btn">zero</button><input id="name"><p id="out"></p>
<script>
let clicks = 0;
document.querySelector('#btn').addEventListener('click', () => {
  clicks++; document.querySelector('#btn').textContent = 'clicked ' + clicks;
});
document.querySelector('#name').addEventListener('input', e => {
  document.querySelector('#out').textContent = e.target.value;
});
</script>`;

const got = await simulateRuntime({
  runtime: "browser",
  engine: "merkava",
  entry: "index.html",
  files: { "index.html": html },
  interactions: [
    { op: "click", selector: "#btn" },
    { op: "assertText", selector: "#btn", expected: "clicked 1" },
    { op: "type", selector: "#name", text: "abc" },
    { op: "assertText", selector: "#out", expected: "abc" }
  ]
});

assert.equal(got.ok, true);
assert.equal(got.interactionLog.length, 4);
assert(got.domSnapshot.documentElement.children.length >= 2);
assert(got.runtimeGraph.nodes.length >= 2);
console.log("B'H merkava device stress ok");
