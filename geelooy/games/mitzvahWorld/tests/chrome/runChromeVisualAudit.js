#!/usr/bin/env node
// B"H
/** Real Chrome visual audit: boot, settle, screenshot, and proof JSON. */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { findBrowser } from "./ChromePath.js";
import { startStaticServer } from "./StaticServer.js";
import { launchChrome } from "./ChromeLauncher.js";
import { connectCdp } from "./ChromeDevTools.js";
import { createChromeIssueLog } from "./ChromeIssueLog.js";

const REPORT_PATH = "tests/chrome/lastChromeVisualAuditReport.json";
const SCREENSHOT_PATH = "tests/chrome/lastChromeVisualAudit.png";
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function textFromArg(arg) { return String(arg.value ?? arg.description ?? arg.unserializableValue ?? arg.type ?? ""); }
function capture(log, event) {
  if (event.method === "Runtime.exceptionThrown") log.error("CHROME_EXCEPTION", event.params.exceptionDetails?.text || "Runtime exception", event.params);
  if (event.method === "Runtime.consoleAPICalled") {
    const type = event.params.type, text = (event.params.args || []).map(textFromArg).join(" ");
    if (type === "error") log.error("CHROME_CONSOLE_ERROR", text, event.params);
    if (type === "warning" || type === "warn") log.warn("CHROME_CONSOLE_WARN", text, event.params);
  }
}

async function writeJson(file, value) { await writeFile(file, JSON.stringify(value, null, 2)); }
async function evalValue(cdp, expression, timeoutMs = 3500) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue:true }, timeoutMs);
  return result.result?.value;
}

function bootExpression() {
  return `(() => ({ readyState:document.readyState, canvases:document.querySelectorAll('canvas').length,
    bootLoaded:Boolean(window.__AWTSMOOS_BOOT_LOADED__), errors:Number(window.__AWTSMOOS_ERROR_COUNT__ || 0),
    progress:window.__AWTSMOOS_WORKER_PROGRESS__ || null, worldReport:window.__AWTSMOOS_LAST_WORLD_REPORT__ || null,
    perf:window.__AWTSMOOS_PERFORMANCE_MODE__ || null, url:location.href, title:document.title }))()`;
}

function visualExpression() {
  return `(() => {
    const progress = window.__AWTSMOOS_WORKER_PROGRESS__ || {};
    const payloads = (progress.payloads || []).slice(-80);
    const final = payloads.find(p => p.stage === 'postbuild:done') || null;
    const world = window.__AWTSMOOS_LAST_WORLD_REPORT__ || null;
    const nodes = [...document.querySelectorAll('[shaym], .mobile-side-panel, canvas')].map(n => n.getAttribute('shaym') || n.className || n.tagName).slice(0,80);
    return { canvases:document.querySelectorAll('canvas').length, final, world, nodes,
      progressTail:(progress.history || []).slice(-25), classes:document.documentElement.className, title:document.title };
  })()`;
}

async function waitForWorld(cdp, log) {
  let last = {};
  for (let attempt = 0; attempt < 180; attempt += 1) {
    try {
      last = await evalValue(cdp, bootExpression());
      if (last?.errors || (last?.bootLoaded && last?.canvases > 0)) return last;
    } catch (error) { log.warn("VISUAL_AUDIT_BOOT_RETRY", error.message, { attempt }); }
    await pause(300);
  }
  return last;
}

async function waitForVisualReady(cdp, log) {
  let last = {};
  for (let attempt = 0; attempt < 300; attempt += 1) {
    try {
      last = await evalValue(cdp, visualExpression(), 5000);
      const tail = Array.isArray(last?.progressTail) ? last.progressTail.join("\n") : "";
      const postbuilt = Boolean(last?.world || last?.final || tail.includes("postbuild:done"));
      const canvasReady = tail.includes("message:takeInCanvas:handleOngoing:done") || tail.includes("world_final_ready");
      if (postbuilt && canvasReady) return last;
    } catch (error) { log.warn("VISUAL_AUDIT_READY_RETRY", error.message, { attempt }); }
    await pause(500);
  }
  return last;
}

async function main() {
  const startedAt = new Date().toISOString(), log = createChromeIssueLog();
  let server; let chrome; let cdp;
  try {
    await writeJson(REPORT_PATH, { ok:false, status:"started", startedAt });
    const browser = findBrowser();
    if (!browser.path) log.error("NO_BROWSER_FOUND", "No Chrome or Edge executable found.", { candidates:browser.candidates });
    server = await startStaticServer(path.resolve(process.cwd(), "../../.."));
    const url = `http://127.0.0.1:${server.port}/geelooy/games/mitzvahWorld/index.html?path=village.json`;
    if (!log.hasErrors()) {
      chrome = await launchChrome(browser.path, url, 9700 + Math.floor(Math.random() * 200), { headless:true, width:1365, height:768 });
      cdp = await connectCdp(chrome.page.webSocketDebuggerUrl, event => capture(log, event));
      await cdp.send("Runtime.enable"); await cdp.send("Log.enable"); await cdp.send("Page.enable");
      const boot = await waitForWorld(cdp, log);
      const visual = await waitForVisualReady(cdp, log);
      await pause(1200);
      const shot = await cdp.send("Page.captureScreenshot", { format:"png", captureBeyondViewport:false }, 12000);
      await mkdir(path.dirname(SCREENSHOT_PATH), { recursive:true });
      await writeFile(SCREENSHOT_PATH, Buffer.from(shot.data || "", "base64"));
      if (!visual?.canvases) log.error("VISUAL_AUDIT_NO_CANVAS", "No canvas found for screenshot.", { boot, visual });
      if (!visual?.world && !visual?.final) log.warn("VISUAL_AUDIT_NO_WORLD_REPORT", "Screenshot captured without main-thread world report.", { boot, visual });
      const report = { ok:!log.hasErrors(), startedAt, url, browser, boot, visual, screenshot:SCREENSHOT_PATH, issueLog:log.toJSON() };
      await writeJson(REPORT_PATH, report); console.log(JSON.stringify(report, null, 2)); if (!report.ok) process.exitCode = 1; return;
    }
    const report = { ok:false, startedAt, browser, issueLog:log.toJSON() };
    await writeJson(REPORT_PATH, report); console.log(JSON.stringify(report, null, 2)); process.exitCode = 1;
  } catch (error) {
    log.error("CHROME_VISUAL_AUDIT_CRASH", error.message, { stack:error.stack });
    const report = { ok:false, startedAt, issueLog:log.toJSON() };
    await writeJson(REPORT_PATH, report); console.error(JSON.stringify(report, null, 2)); process.exitCode = 1;
  } finally { try { cdp?.close(); } catch {} try { await chrome?.close(); } catch {} try { await server?.close(); } catch {} }
}

main();
