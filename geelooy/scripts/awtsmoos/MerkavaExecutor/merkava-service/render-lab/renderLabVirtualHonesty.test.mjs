// B"H
/**
 * Honesty tests for the native Merkava path: interactions that need a real
 * browser (coordinate input, key codes, wheel scroll) must FAIL LOUDLY as
 * chrome-only on the merkava mode — never silently fake success.
 * All run through runRenderLab, the exact tunnel-path call.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { runRenderLab } from "./renderLab.js";

const HTML = `<!doctype html><html><body><button id="b">hi</button><input id="i"></body></html>`;

async function merkavaRun(interactions) {
  const lab = await runRenderLab({ html: HTML, modes: ["merkava"], interactions });
  assert.equal(lab.results.length, 1);
  return lab.results[0];
}

test("coordinate click on merkava fails loudly as chrome-only", async () => {
  const result = await merkavaRun([{ action: "click", x: 50, y: 50 }]);
  const failures = result.interactionLog.filter(step => step.ok === false);
  assert.ok(failures.length > 0, "coordinate click must not succeed on the virtual path");
  assert.ok(failures[0].error.includes("chrome-only"), `expected chrome-only error, got: ${failures[0].error}`);
});

test("keydown with explicit code on merkava fails loudly as chrome-only", async () => {
  const result = await merkavaRun([{ action: "keyboard", keyboardAction: "keydown", key: "a", code: "KeyA" }]);
  const failures = result.interactionLog.filter(step => step.ok === false);
  assert.ok(failures.length > 0, "coded keydown must not succeed on the virtual path");
  assert.ok(failures[0].error.includes("chrome-only"), `expected chrome-only error, got: ${failures[0].error}`);
});

test("wheel scroll on merkava fails loudly as chrome-only", async () => {
  const result = await merkavaRun([{ action: "scroll", x: 100, y: 100, deltaY: 300 }]);
  const failures = result.interactionLog.filter(step => step.ok === false);
  assert.ok(failures.length > 0, "wheel scroll must not succeed on the virtual path");
  assert.ok(failures[0].error.includes("chrome-only"), `expected chrome-only error, got: ${failures[0].error}`);
});

test("selector click still works on the virtual path", async () => {
  const result = await merkavaRun([{ action: "click", selector: "#b" }]);
  const okSteps = result.interactionLog.filter(step => step.ok === true);
  assert.ok(okSteps.length > 0, "selector click should keep working on the virtual path");
});
