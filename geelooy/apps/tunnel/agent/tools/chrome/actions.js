// B"H
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const { ROOT, loadConfig, saveConfigPatch } = require("../../lib/config.js");
const { findChrome, chromeFindDetails } = require("./finder.js");
const { version, pages, ensurePage, cdpCall, navigateAndWait } = require("./cdp.js");
const { boolish, chromeLaunchArgs } = require("./launchArgs.js");
const { addChromeLog, readChromeLogs } = require("./logs.js");
const { pageSnapshot } = require("./snapshot.js");
const { compactRemoteResult, compactLogs, compactExpression } = require("./compact.js");
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function requireChromeEnabled(config, action) { return !config.chrome.enabled || !config.tools.chrome ? { ok:false, action, error:"chrome_disabled", message:"Enable Chrome tool in dashboard and Save Config." } : null; }
function logOptions(payload = {}) { return { maxLogs:Number(payload.maxLogs ?? 40), clear:!!payload.clearLogs }; }
function readCompactLogs(payload = {}) { return compactLogs(readChromeLogs(logOptions(payload)), payload.maxLogs ?? 40); }
function timeoutOf(payload = {}, fallback = 30000) { const n = Number(payload.timeoutMs || fallback); return Number.isFinite(n) ? Math.max(1000, Math.min(n, Number(process.env.AWTSMOOS_CHROME_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000))) : fallback; }
async function chromeFind() { return { ok:true, action:"chromeFind", ...chromeFindDetails() }; }
async function chromeLaunch(payload = {}) {
  const config = loadConfig(), blocked = requireChromeEnabled(config, "chromeLaunch"); if (blocked) return blocked;
  const port = Number(payload.port || config.chrome.port || 9222), chromePath = payload.chromePath || config.chrome.path || findChrome();
  if (!chromePath) return { ok:false, action:"chromeLaunch", error:"chrome_not_found", ...chromeFindDetails(), message:"Could not auto-detect browser executable." };
  const userDataDir = payload.userDataDir || config.chrome.userDataDir || path.join(ROOT, "chrome-profile"), headless = boolish(payload.headless, boolish(config.chrome.headless, false)), args = chromeLaunchArgs({ port, userDataDir, headless, url:payload.url });
  fs.mkdirSync(userDataDir, { recursive:true });
  const proc = childProcess.spawn(chromePath, args, { detached:true, stdio:["ignore", "pipe", "pipe"] });
  proc.stdout?.on("data", c => addChromeLog("process.stdout", "info", c.toString("utf8").trim())); proc.stderr?.on("data", c => addChromeLog("process.stderr", "error", c.toString("utf8").trim())); proc.on("error", err => addChromeLog("process", "error", err.message, { stack:err.stack })); proc.unref();
  saveConfigPatch({ chrome:{ enabled:true, path:chromePath, chromePath, port, userDataDir, headless }, tools:{ chrome:true } });
  await wait(Number(payload.startupWaitMs || 1600)); await ensurePage(port);
  return { ok:true, action:"chromeLaunch", chromePath, port, userDataDir, headless, argsCount:args.length, url:payload.url || "", logs:readCompactLogs(payload) };
}
async function chromeStatus(payload = {}) {
  const config = loadConfig(), port = Number(payload.port || config.chrome.port || 9222);
  try { const info = await version(port), list = await pages(port); return { ok:true, action:"chromeStatus", connected:true, port, chromePath:config.chrome.path || findChrome(), headless:!!config.chrome.headless, info:{ Browser:info.Browser, ProtocolVersion:info.ProtocolVersion, webSocketDebuggerUrl:Boolean(info.webSocketDebuggerUrl) }, pageCount:list.length, pages:list.map(p => ({ id:p.id, title:String(p.title || "").slice(0, 200), url:String(p.url || "").slice(0, 500), type:p.type })).slice(0, Number(payload.maxPages || 20)), logs:readCompactLogs(payload) }; }
  catch (e) { return { ok:true, action:"chromeStatus", connected:false, port, chromePath:config.chrome.path || findChrome(), ...chromeFindDetails(), error:e.message, logs:readCompactLogs(payload) }; }
}
async function chromeNavigate(payload = {}) {
  const config = loadConfig(), blocked = requireChromeEnabled(config, "chromeNavigate"); if (blocked) return blocked;
  const port = Number(payload.port || config.chrome.port || 9222); await ensurePage(port); if (payload.clearLogs !== false) readChromeLogs({ clear:true });
  const url = payload.url || "about:blank", nav = await navigateAndWait(url, timeoutOf(payload), port); if (payload.waitMs) await wait(Math.min(Number(payload.waitMs), 30000));
  return { ok:true, action:"chromeNavigate", url, navigation:nav, snapshot:payload.snapshot === false ? null : await pageSnapshot({ ...payload, maxText:Math.min(Number(payload.maxText || 2000), 5000) }), logs:readCompactLogs(payload) };
}
async function chromeEval(payload = {}) {
  const config = loadConfig(), blocked = requireChromeEnabled(config, "chromeEval"); if (blocked) return blocked;
  const port = Number(payload.port || config.chrome.port || 9222); await ensurePage(port);
  const expression = payload.expression || payload.script || "document.title";
  try { const result = await cdpCall("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutOf(payload)); return { ok:true, action:"chromeEval", expression:compactExpression(expression), result:compactRemoteResult(result, Number(payload.maxValueChars || payload.maxChars || 16000)), logs:readCompactLogs(payload) }; }
  catch (e) { return { ok:false, action:"chromeEval", error:e.message, expression:compactExpression(expression), logs:readCompactLogs(payload) }; }
}
async function chromeWaitForSelector(payload = {}) {
  const config = loadConfig(), blocked = requireChromeEnabled(config, "chromeWaitForSelector"); if (blocked) return blocked;
  const port = Number(payload.port || config.chrome.port || 9222); await ensurePage(port); const selector = payload.selector, timeout = timeoutOf(payload, 10000); if (!selector) return { ok:false, action:"chromeWaitForSelector", error:"missing_selector" };
  const start = Date.now(); while (Date.now() - start < timeout) { const result = await cdpCall("Runtime.evaluate", { expression:"!!document.querySelector(" + JSON.stringify(selector) + ")", returnByValue:true }, Math.min(timeout, 10000)); if (result.result?.value) return { ok:true, action:"chromeWaitForSelector", selector, found:true, durationMs:Date.now() - start }; await wait(250); }
  return { ok:false, action:"chromeWaitForSelector", selector, found:false, timeout, logs:readCompactLogs(payload) };
}
async function chromeClick(payload = {}) { return await evalElementAction("chromeClick", payload, `el.scrollIntoView({block:"center",inline:"center"}); el.click(); return {ok:true,text:el.innerText||el.value||el.getAttribute("aria-label")||""};`); }
async function chromeType(payload = {}) { const text = payload.text || ""; return await evalElementAction("chromeType", payload, `el.focus(); el.value=${JSON.stringify(text)}; el.dispatchEvent(new Event("input",{bubbles:true})); el.dispatchEvent(new Event("change",{bubbles:true})); return {ok:true,value:el.value};`, { textLength:text.length }); }
async function evalElementAction(action, payload, body, extra = {}) {
  const config = loadConfig(), blocked = requireChromeEnabled(config, action); if (blocked) return blocked; const port = Number(payload.port || config.chrome.port || 9222); await ensurePage(port); const selector = payload.selector; if (!selector) return { ok:false, action, error:"missing_selector" };
  const expression = `(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) return {ok:false,error:"not_found"}; ${body} })()`;
  const result = await cdpCall("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutOf(payload)); return { ok:true, action, selector, ...extra, result:compactRemoteResult(result, Number(payload.maxValueChars || 8000)), logs:readCompactLogs(payload) };
}
async function chromeLogs(payload = {}) { return { ok:true, action:"chromeLogs", ...readCompactLogs({ ...payload, maxLogs:payload.maxLogs ?? 80 }) }; }
async function chromeSnapshot(payload = {}) { const config = loadConfig(), blocked = requireChromeEnabled(config, "chromeSnapshot"); if (blocked) return blocked; const port = Number(payload.port || config.chrome.port || 9222); await ensurePage(port); return { ok:true, action:"chromeSnapshot", ...(await pageSnapshot({ ...payload, maxText:Math.min(Number(payload.maxText || 4000), 10000) })) }; }
async function chromeRunScript(payload = {}) {
  const steps = Array.isArray(payload.script) ? payload.script : [], results = [];
  const dispatch = { goto:s => chromeNavigate({ ...payload, url:s.url, timeoutMs:s.timeoutMs || payload.timeoutMs }), navigate:s => chromeNavigate({ ...payload, url:s.url, timeoutMs:s.timeoutMs || payload.timeoutMs }), waitForSelector:s => chromeWaitForSelector({ ...payload, selector:s.selector, timeoutMs:s.timeoutMs || payload.timeoutMs }), click:s => chromeClick({ ...payload, selector:s.selector }), type:s => chromeType({ ...payload, selector:s.selector, text:s.text || "" }), eval:s => chromeEval({ ...payload, expression:s.expression || "document.title" }), logs:s => chromeLogs({ ...payload, ...s }), snapshot:s => chromeSnapshot({ ...payload, ...s }) };
  for (const step of steps) results.push(dispatch[step.type || step.action] ? await dispatch[step.type || step.action](step) : { ok:false, error:"unknown_step", stepType:step.type || step.action });
  return { ok:results.every(x => x.ok !== false), action:"chromeRunScript", count:steps.length, results:results.slice(0, Number(payload.maxStepResults || 50)), logs:readCompactLogs(payload) };
}
module.exports = { chromeFind, chromeLaunch, chromeStatus, chromeNavigate, chromeEval, chromeWaitForSelector, chromeClick, chromeType, chromeLogs, chromeSnapshot, chromeRunScript };
