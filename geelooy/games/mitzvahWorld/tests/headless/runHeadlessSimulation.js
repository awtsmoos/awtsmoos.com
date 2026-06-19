#!/usr/bin/env node
// B"H
/**
 * Node simulation runner: the Awtsmoos gives the browser a paper crown, then
 * demands it reveal the perf contract without hiding warnings in the dust.
 */
import { writeFile } from "node:fs/promises";
import { createFrameClock } from "./FrameClock.js";
import { createFakeDom } from "./FakeDom.js";
import { createFakeRenderer, attachRendererLater } from "./FakeRenderer.js";
import { assertFrameRun, assertRendererReport } from "./SimulationAssertions.js";
import { createIssueLog } from "./HeadlessIssueLog.js";

function defineGlobal(name, value) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

function repeatCount() {
  const arg = process.argv.find(value => value.startsWith("--repeat="));
  const count = Number(arg?.split("=")[1] || 5);
  return Number.isFinite(count) && count > 0 ? Math.min(100, Math.floor(count)) : 5;
}

async function importPerformanceBootstrap(index) {
  const stamp = `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
  return import(`../../systems/performance/PerformanceModeBootstrap.js?headless=${stamp}`);
}

async function runOnce(index, log) {
  const clock = createFrameClock();
  const { window, document } = createFakeDom(clock);
  const { renderer } = createFakeRenderer();
  defineGlobal("window", window);
  defineGlobal("document", document);
  defineGlobal("navigator", window.navigator);
  attachRendererLater(window, renderer, 3);
  await importPerformanceBootstrap(index);
  await clock.step(16);
  const report = assertRendererReport(window, renderer);
  for (let frame = 0; frame < 240; frame += 1) {
    renderer.render({ name: "headlessScene" }, { name: "headlessCamera" });
    await clock.step(1);
  }
  const summary = {
    run: index,
    frames: 240,
    virtualMs: Number(clock.now().toFixed(3)),
    virtualFps: Number((1000 / clock.frameMs).toFixed(3)),
    pixelRatio: Number(renderer.pixelRatio.toFixed(3)),
    renderCalls: renderer.info.render.calls,
    rendererApplied: report.rendererApplied,
    rendererFound: report.rendererFound,
    tier: report.tier?.tier || report.tier || "unknown"
  };
  assertFrameRun(summary);
  if (summary.virtualFps < 60) log.warn("NODE_FPS_LOW", "Virtual frame clock fell under 60.", summary);
  return summary;
}

async function main() {
  const log = createIssueLog("node-dom-fake-webgl");
  const repeats = repeatCount();
  const runs = [];
  for (let i = 1; i <= repeats; i += 1) runs.push(await runOnce(i, log));
  const result = { ok: !log.hasErrors(), repeats, targetFps: 60, simulatedLayer: "node-dom-fake-webgl", runs, issueLog: log.toJSON() };
  await writeFile("tests/headless/lastHeadlessIssueReport.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch(async error => {
  const log = createIssueLog("node-dom-fake-webgl");
  log.error("NODE_SIMULATION_CRASH", error.message, error.detail || {});
  await writeFile("tests/headless/lastHeadlessIssueReport.json", JSON.stringify(log.toJSON(), null, 2));
  console.error("B'H headless simulation failed:", error.message);
  if (error.detail) console.error(JSON.stringify(error.detail, null, 2));
  process.exitCode = 1;
});
