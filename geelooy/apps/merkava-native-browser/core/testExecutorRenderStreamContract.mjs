// B"H
import assert from "assert";
import { buildMerkavaExecutorRenderStream } from "./merkavaExecutorRenderStream.js";

const html = `
<body>
  <main id="app">
    <canvas id="stage" width="160" height="90"></canvas>
    <button id="draw">draw</button>
    <output id="status">ready</output>
  </main>
</body>`;

const script = `
const canvas = document.querySelector("#stage");
const status = document.querySelector("#status");
const gl = canvas.getContext("webgl");
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.02, 0.08, 0.16, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
document.querySelector("#draw").addEventListener("click", () => {
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  status.textContent = "drawn";
});`;

const result = await buildMerkavaExecutorRenderStream({
  html,
  scripts: [script],
  url: "file:///contract.html"
});

const lines = result.stream.split(/\n/).filter(Boolean);
assert.equal(result.summary.hydration.ok, true);
assert.ok(result.summary.commandCount >= 8);
assert.ok(lines.some(line => line.includes("WEBGL") && line.includes("webgl.viewport")));
assert.ok(lines.some(line => line.includes("WEBGL") && line.includes("webgl.drawArrays")));
assert.ok(lines.some(line => line.startsWith("BOX|") && line.includes("#102038")));
assert.ok(lines.some(line => line.startsWith("TEXT|") && line.includes("|drawn|")));
assert.ok(result.snapshot.commands.some(command => command.op === "webgl.drawArrays"));

console.log(JSON.stringify({
  ok: true,
  commandCount: result.summary.commandCount,
  textureCount: result.summary.textureCount,
  streamBytes: result.summary.streamBytes,
  lines: lines.length
}, null, 2));
