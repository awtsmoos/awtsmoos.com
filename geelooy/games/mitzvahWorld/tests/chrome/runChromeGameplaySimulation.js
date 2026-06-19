#!/usr/bin/env node
// B"H
/** Real Chrome gameplay sampler: movement, combat-clicks, talk keys, rAF truth. */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { findBrowser } from "./ChromePath.js";
import { startStaticServer } from "./StaticServer.js";
import { launchChrome } from "./ChromeLauncher.js";
import { connectCdp } from "./ChromeDevTools.js";
import { createChromeIssueLog } from "./ChromeIssueLog.js";
import { gameplaySamplerExpression } from "./ChromeFpsSampler.js";

const REPORT_PATH = "tests/chrome/lastChromeGameplayReport.json";
const startedAt = new Date().toISOString();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function argValue(name, fallback) {
  const found = process.argv.find(value => value.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function argFlag(name) { return process.argv.includes(`--${name}`) || process.argv.includes(`--${name}=true`); }
function textFromArg(arg) { return String(arg.value ?? arg.description ?? arg.unserializableValue ?? arg.type ?? ""); }

function capture(log, event) {
  if (event.method === "Runtime.exceptionThrown") log.error("CHROME_EXCEPTION", event.params.exceptionDetails?.text || "Runtime exception", event.params);
  if (event.method === "Runtime.consoleAPICalled") {
    const type = event.params.type;
    const text = (event.params.args || []).map(textFromArg).join(" ");
    if (type === "error") log.error("CHROME_CONSOLE_ERROR", text, event.params);
    if (type === "warning" || type === "warn") log.warn("CHROME_CONSOLE_WARN", text, event.params);
  }
}

async function writeReport(report) { await writeFile(REPORT_PATH, JSON.stringify(report, null, 2)); }
async function quickEval(cdp, expression, timeoutMs = 2500) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true }, timeoutMs);
  return result.result?.value;
}

function bootExpression() {
  return `(() => ({ readyState: document.readyState, canvases: document.querySelectorAll('canvas').length,
    bootLoaded: Boolean(window.__AWTSMOOS_BOOT_LOADED__), errors: Number(window.__AWTSMOOS_ERROR_COUNT__ || 0),
    lastError: window.__AWTSMOOS_LAST_ERROR__ || null, perf: window.__AWTSMOOS_PERFORMANCE_MODE__ || null,
    pixelGovernor: window.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__ || null, url: location.href, title: document.title }))()`;
}

async function waitForPlayable(cdp, log) {
  let last = {};
  for (let index = 0; index < 90; index += 1) {
    try {
      last = await quickEval(cdp, bootExpression(), 2500);
      if (last?.errors || (last?.canvases > 0 && (last?.bootLoaded || last?.perf))) return last;
    } catch (error) { log.warn("CDP_BOOT_POLL_RETRY", error.message, { index }); }
    await pause(300);
  }
  return last;
}

async function sampleGameplay(cdp, durationMs) {
  const result = await cdp.send("Runtime.evaluate", { expression: gameplaySamplerExpression(durationMs), awaitPromise: true, returnByValue: true }, durationMs + 18000);
  return result.result?.value || {};
}

function optimized(sample) {
  const perf = sample?.perf || {};
  const governor = sample?.pixelGovernor || perf.workerPixelRatioState || {};
  return Boolean(perf.rendererApplied || perf.workerPixelRatioApplied || governor.applied || Number(governor.pixelRatio) <= 0.82);
}

function assertGameplay(log, boot, sample) {
  if (!sample?.canvases && !boot?.canvases) log.error("NO_CANVAS_FOUND", "Gameplay run found no canvas.", { boot, sample });
  if (sample?.errors || boot?.errors) log.error("AWTSMOOS_RUNTIME_ERRORS", "Runtime errors during gameplay sample.", { boot, sample });
  if (!optimized(sample)) log.error("PERF_OPTIMIZATION_NOT_APPLIED", "No worker/main render clamp proof during gameplay.", { boot, sample });
  if (sample?.fps && sample.fps < 55) log.error("CHROME_GAMEPLAY_FPS_BELOW_55", "Real Chrome gameplay FPS below 55.", sample);
  if (sample?.p95FrameMs && sample.p95FrameMs > 34) log.error("CHROME_GAMEPLAY_P95_OVER_34", "Real Chrome p95 frame time exceeded 34ms.", sample);
  if (sample?.frameCount && sample.droppedFrames > sample.frameCount * 0.05) log.warn("CHROME_GAMEPLAY_DROPS", "More than 5% frames exceeded 34ms.", sample);
}

async function main() {
  const log = createChromeIssueLog();
  let server; let chrome; let cdp;
  try {
    await writeReport({ ok: false, status: "started", startedAt });
    const durationMs = Number(argValue("duration", "30000"));
    const headed = argFlag("headed");
    const browser = findBrowser();
    const level = encodeURIComponent(argValue("level", "village.json"));
    if (!browser.path) log.error("NO_BROWSER_FOUND", "No Chrome or Edge executable found.", { candidates: browser.candidates });
    if (typeof WebSocket === "undefined") log.error("NO_NODE_WEBSOCKET", "Node global WebSocket is unavailable.");
    server = await startStaticServer(path.resolve(process.cwd(), "../../.."));
    const url = `http://127.0.0.1:${server.port}/geelooy/games/mitzvahWorld/index.html?path=${level}`;
    if (!log.hasErrors()) {
      chrome = await launchChrome(browser.path, url, 9600 + Math.floor(Math.random() * 300), { headless: !headed, width: 1280, height: 720 });
      cdp = await connectCdp(chrome.page.webSocketDebuggerUrl, event => capture(log, event));
      await cdp.send("Runtime.enable"); await cdp.send("Log.enable");
      try { await cdp.send("Page.bringToFront"); } catch {}
      const boot = await waitForPlayable(cdp, log);
      const sample = await sampleGameplay(cdp, durationMs);
      assertGameplay(log, boot, sample);
      const report = { ok: !log.hasErrors(), headed, durationMs, startedAt, url, browser, boot, sample, issueLog: log.toJSON() };
      await writeReport(report); console.log(JSON.stringify(report, null, 2));
      if (!report.ok) process.exitCode = 1; return;
    }
    const report = { ok: false, headed, startedAt, browser, issueLog: log.toJSON() };
    await writeReport(report); console.log(JSON.stringify(report, null, 2)); process.exitCode = 1;
  } catch (error) {
    log.error("CHROME_GAMEPLAY_SIMULATION_CRASH", error.message, { stack: error.stack });
    const report = { ok: false, startedAt, issueLog: log.toJSON() };
    await writeReport(report); console.error(JSON.stringify(report, null, 2)); process.exitCode = 1;
  } finally { try { cdp?.close(); } catch {} try { await chrome?.close(); } catch {} try { await server?.close(); } catch {} }
}

main();
