#!/usr/bin/env node
// B"H
/** Real Chrome gate: OffscreenCanvas worker pixel governor is a valid renderer clamp. */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { findBrowser } from "./ChromePath.js";
import { startStaticServer } from "./StaticServer.js";
import { launchChrome } from "./ChromeLauncher.js";
import { connectCdp } from "./ChromeDevTools.js";
import { createChromeIssueLog } from "./ChromeIssueLog.js";

const REPORT_PATH = "tests/chrome/lastChromeSimulationReport.json";
const startedAt = new Date().toISOString();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function argValue(name, fallback) {
  const found = process.argv.find(value => value.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function textFromArg(arg) {
  return String(arg.value ?? arg.description ?? arg.unserializableValue ?? arg.type ?? "");
}

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

function snapshotExpression() {
  return `(() => ({
    readyState: document.readyState, url: location.href, title: document.title,
    canvases: document.querySelectorAll('canvas').length,
    bootStarted: Boolean(window.__AWTSMOOS_BOOT_STARTED__),
    bootLoaded: Boolean(window.__AWTSMOOS_BOOT_LOADED__),
    errors: Number(window.__AWTSMOOS_ERROR_COUNT__ || 0),
    lastError: window.__AWTSMOOS_LAST_ERROR__ || null,
    perf: window.__AWTSMOOS_PERFORMANCE_MODE__ || null,
    pixelGovernor: window.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__ || null,
    discovery: window.__AWTSMOOS_RENDERER_DISCOVERY__ || null,
    attempts: Number(window.__AWTSMOOS_PERFORMANCE_ATTEMPTS__ || 0),
    now: performance.now()
  }))()`;
}

function optimized(state = {}) {
  const perf = state.perf || {};
  const governor = state.pixelGovernor || perf.workerPixelRatioState || {};
  return Boolean(perf.rendererApplied || perf.workerPixelRatioApplied || governor.applied || Number(governor.pixelRatio) <= 0.82);
}

async function pollSnapshot(cdp, log) {
  let last = null;
  for (let index = 0; index < 56; index += 1) {
    try {
      last = await quickEval(cdp, snapshotExpression(), 2500);
      if (last?.errors || (last?.canvases > 0 && optimized(last))) return last;
    } catch (error) { log.warn("CDP_POLL_RETRY", error.message, { index }); }
    await pause(350);
  }
  return last || {};
}

async function browserStats(cdp) {
  try {
    return await quickEval(cdp, `(() => {
      const perf = window.__AWTSMOOS_PERFORMANCE_MODE__ || {};
      const governor = window.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__ || perf.workerPixelRatioState || null;
      return {
        canvases: document.querySelectorAll('canvas').length,
        rendererFound: Boolean(perf.rendererFound), rendererApplied: Boolean(perf.rendererApplied),
        mainRendererFound: Boolean(perf.mainRendererFound), mainRendererApplied: Boolean(perf.mainRendererApplied),
        workerPixelRatioApplied: Boolean(perf.workerPixelRatioApplied || governor?.applied || Number(governor?.pixelRatio) <= 0.82),
        pixelGovernor: governor, attempts: Number(window.__AWTSMOOS_PERFORMANCE_ATTEMPTS__ || 0),
        classes: document.documentElement.className
      };
    })()`, 2500);
  } catch (error) { return { statsError: error.message }; }
}

function assertRun(log, snapshot, stats) {
  const perf = snapshot?.perf || {};
  const okOptimized = optimized(snapshot) || stats?.rendererApplied || stats?.workerPixelRatioApplied;
  if (!snapshot?.canvases && !stats?.canvases) log.error("NO_CANVAS_FOUND", "Chrome found no canvas.", { snapshot, stats });
  if (snapshot?.errors) log.error("AWTSMOOS_RUNTIME_ERRORS", "Game reported runtime errors.", { snapshot, stats });
  if (!perf && !stats?.statsError) log.error("PERF_REPORT_MISSING", "Performance mode report missing.", { snapshot, stats });
  if (!okOptimized) log.error("PERF_OPTIMIZATION_NOT_APPLIED", "No renderer clamp or worker pixel governor proof.", { snapshot, stats });
  if (!stats?.mainRendererFound && stats?.workerPixelRatioApplied) log.warn("MAIN_RENDERER_IN_WORKER", "Main renderer is hidden in worker; pixel governor clamp is the real proof.", { stats });
}

async function main() {
  const log = createChromeIssueLog();
  let server; let chrome; let cdp;
  try {
    await writeReport({ ok: false, status: "started", startedAt });
    const browser = findBrowser();
    const level = encodeURIComponent(argValue("level", "village.json"));
    if (!browser.path) log.error("NO_BROWSER_FOUND", "No Chrome or Edge executable found.", { candidates: browser.candidates });
    if (typeof WebSocket === "undefined") log.error("NO_NODE_WEBSOCKET", "Node global WebSocket is unavailable.");
    server = await startStaticServer(path.resolve(process.cwd(), "../../.."));
    const url = `http://127.0.0.1:${server.port}/geelooy/games/mitzvahWorld/index.html?path=${level}`;
    if (!log.hasErrors()) {
      chrome = await launchChrome(browser.path, url, 9300 + Math.floor(Math.random() * 500));
      cdp = await connectCdp(chrome.page.webSocketDebuggerUrl, event => capture(log, event));
      await cdp.send("Runtime.enable"); await cdp.send("Log.enable"); await pause(900);
      const snapshot = await pollSnapshot(cdp, log);
      const stats = await browserStats(cdp);
      assertRun(log, snapshot, stats);
      const report = { ok: !log.hasErrors(), startedAt, url, browser, level, snapshot, stats, issueLog: log.toJSON() };
      await writeReport(report); console.log(JSON.stringify(report, null, 2));
      if (!report.ok) process.exitCode = 1; return;
    }
    const report = { ok: false, startedAt, browser, issueLog: log.toJSON() };
    await writeReport(report); console.log(JSON.stringify(report, null, 2)); process.exitCode = 1;
  } catch (error) {
    log.error("CHROME_SIMULATION_CRASH", error.message, { stack: error.stack });
    const report = { ok: false, startedAt, issueLog: log.toJSON() };
    await writeReport(report); console.error(JSON.stringify(report, null, 2)); process.exitCode = 1;
  } finally { try { cdp?.close(); } catch {} try { await chrome?.close(); } catch {} try { await server?.close(); } catch {} }
}

main();
