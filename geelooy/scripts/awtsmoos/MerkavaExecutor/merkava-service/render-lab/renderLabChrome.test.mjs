// B"H
/**
 * Adversarial tests for the tunnel render-lab Chrome path.
 *
 * Every test runs THROUGH runRenderLab with mode=chrome-if-available — the
 * exact in-process call the tunnel's renderLabActions makes — and asserts
 * real browser behavior: page <script>s execute to completion (full JS),
 * and keyboard/mouse input events are faithfully dispatched via CDP Input.
 * If Chrome were absent the runs would fall back to Merkava's static renderer
 * and these assertions would fail loudly; they must not pass on a fallback.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { runRenderLab } from "./renderLab.js";

const CHROME = "chrome-if-available";

async function chromeResult(payload) {
  const lab = await runRenderLab({ ...payload, modes: [CHROME] });
  assert.equal(lab.results.length, 1, "expected exactly one mode result");
  const result = lab.results[0];
  assert.ok(String(result.engine || "").includes("chrome"), `expected a real chrome backend, got engine=${result.engine}`);
  assert.equal(result.screenshot?.backend, "chrome-headless-cdp", `expected chrome screenshot proof, got ${result.screenshot?.backend}`);
  return result;
}

test("T1: page <script> executes to completion (full JS evaluation)", async () => {
  const html = `<!doctype html><html><body><h1>T1</h1><script>window.__t1 = "js-ran";</script></body></html>`;
  const result = await chromeResult({ html, returnValues: ["window.__t1"] });
  assert.equal(result.ok, true, `run failed: ${JSON.stringify(result.errors)}`);
  assert.equal(result.values["window.__t1"], "js-ran", "page script did not execute");
});

test("T2: click at coordinates fires mousedown/mouseup/click and increments counter", async () => {
  const html = `<!doctype html><html><body>
<button id="b" style="position:fixed;left:50px;top:60px;width:120px;height:40px;">click me</button>
<script>
window.__t2 = 0;
document.getElementById("b").addEventListener("click", () => { window.__t2++; });
</script></body></html>`;
  const result = await chromeResult({
    html,
    interactions: [{ action: "click", x: 110, y: 80 }],
    returnValues: ["window.__t2"]
  });
  assert.equal(result.ok, true, `run failed: ${JSON.stringify(result.errors)}`);
  assert.equal(result.values["window.__t2"], 1, "coordinate click did not reach the button");
  const clickStep = result.interactionLog.find(step => step.ok === true);
  assert.ok(clickStep, "expected a successful interaction log entry");
});

test("T3: keydown dispatch carries key + code to the page handler", async () => {
  const html = `<!doctype html><html><body>
<input id="i">
<script>
window.__t3 = null;
document.getElementById("i").addEventListener("keydown", e => {
  window.__t3 = { key: e.key, code: e.code };
});
</script></body></html>`;
  const result = await chromeResult({
    html,
    interactions: [{ action: "keyboard", keyboardAction: "keydown", selector: "#i", key: "a", code: "KeyA" }],
    returnValues: ["window.__t3"]
  });
  assert.equal(result.ok, true, `run failed: ${JSON.stringify(result.errors)}`);
  assert.deepEqual(result.values["window.__t3"], { key: "a", code: "KeyA" });
});

test("T4: hover changes element state and wheel scroll changes scrollY", async () => {
  const html = `<!doctype html><html><body>
<div id="h" style="position:fixed;left:10px;top:10px;width:100px;height:100px;background:#c00;"></div>
<div style="height:3000px;"></div>
<script>
window.__hovered = false;
addEventListener("scroll", () => { window.__scrolledY = window.scrollY; });
document.getElementById("h").addEventListener("mouseover", () => { window.__hovered = true; });
</script></body></html>`;
  const result = await chromeResult({
    html,
    interactions: [
      { action: "hover", x: 60, y: 60 },
      { action: "scroll", x: 400, y: 300, deltaY: 400 }
    ],
    returnValues: ["window.__hovered", "window.__scrolledY"]
  });
  assert.equal(result.ok, true, `run failed: ${JSON.stringify(result.errors)}`);
  assert.equal(result.values["window.__hovered"], true, "hover did not fire mouseover");
  assert.ok(Number(result.values["window.__scrolledY"]) > 0, `wheel scroll did not move the page (scrollY=${result.values["window.__scrolledY"]})`);
});
