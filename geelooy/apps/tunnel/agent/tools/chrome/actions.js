// B"H
const fs = require("fs"), path = require("path"), childProcess = require("child_process");
const { ROOT, loadConfig, saveConfigPatch } = require("../../lib/config.js");
const { findChrome, chromeFindDetails } = require("./finder.js");
const cdp = require("./cdp.js");
const { boolish, chromeLaunchArgs } = require("./launchArgs.js");
const { addChromeLog, readChromeLogs } = require("./logs.js");
const ChromeProcesses = require("./processes.js");
const { pageSnapshot } = require("./snapshot.js");
const { compactRemoteResult, compactLogs, compactExpression } = require("./compact.js");
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function param(p, key, fallback = "") { return p[key] ?? p.params?.[key] ?? fallback; }
function urlOf(p, fallback = "about:blank") { return String(param(p, "url", param(p, "href", param(p, "targetUrl", fallback))) || fallback); }
function expressionOf(p, fallback = "document.title") { return String(param(p, "expression", param(p, "script", param(p, "source", param(p, "code", param(p, "command", param(p, "text", fallback)))))) || fallback); }
function requireChromeEnabled(config, action) { return !config.chrome.enabled || !config.tools.chrome ? { ok:false, action, error:"chrome_disabled", message:"Enable Chrome tool in dashboard and Save Config." } : null; }
function logOptions(p = {}) { return { maxLogs:Number(param(p, "maxLogs", 20)), clear:!!param(p, "clearLogs", false) }; }
function readCompactLogs(p = {}) { return compactLogs(readChromeLogs(logOptions(p)), param(p, "maxLogs", 20)); }
function timeoutOf(p = {}, fallback = 30000) { const n = Number(param(p, "timeoutMs", fallback)); return Number.isFinite(n) ? Math.max(1000, Math.min(n, Number(process.env.AWTSMOOS_CHROME_MAX_TIMEOUT_MS || 86400000))) : fallback; }
function chromeConfig(payload, action) { const config = loadConfig(), blocked = requireChromeEnabled(config, action); return { config, blocked, port:Number(param(payload, "port", config.chrome.port || 9222)) }; }
async function chromeFind() { return { ok:true, action:"chromeFind", ...chromeFindDetails() }; }
async function waitForChromePage(port, options = {}) {
 const timeoutMs = timeoutOf(options, 15000);
 const startedAt = Date.now();
 let lastError = null;
 while (Date.now() - startedAt < timeoutMs) {
  try {
   return await cdp.ensurePage(port, {
    forceReconnect:true,
    url:options.url,
    timeoutMs:Math.min(3000, timeoutMs)
   });
  } catch (error) {
   lastError = error;
   await wait(100);
  }
 }
 const error = new Error(`chrome_startup_timeout:${port}:${lastError?.message || "devtools_not_ready"}`);
 error.code = "CHROME_STARTUP_TIMEOUT";
 throw error;
}
async function chromeLaunch(p = {}) {
 const config = loadConfig(), blocked = requireChromeEnabled(config, "chromeLaunch");
 if (blocked) return blocked;
 const port = Number(param(p, "port", config.chrome.port || 9222));
 const chromePath = param(p, "chromePath", config.chrome.path || findChrome());
 if (!chromePath) return { ok:false, action:"chromeLaunch", error:"chrome_not_found", ...chromeFindDetails() };
 const userDataDir = param(p, "userDataDir", config.chrome.userDataDir || path.join(ROOT, "chrome-profile"));
 const headless = boolish(param(p, "headless", undefined), boolish(config.chrome.headless, false));
 const url = urlOf(p, "about:blank");
 const args = chromeLaunchArgs({ port, userDataDir, headless, url });
 const persist = param(p, "persist", true) !== false;
 fs.mkdirSync(userDataDir, { recursive:true });
 const proc = childProcess.spawn(chromePath, args, { detached:true, stdio:"ignore" });
 proc.on("error", e => addChromeLog("process", "error", e.message, { stack:e.stack }));
 proc.unref();
 ChromeProcesses.register({ pid:proc.pid, port, userDataDir });
 addChromeLog("process", "info", "Chrome launch requested.", { pid:proc.pid, port, headless, url, persist });
 if (persist) saveConfigPatch({ chrome:{ enabled:true, path:chromePath, chromePath, port, userDataDir, headless }, tools:{ chrome:true } });
 await wait(Math.min(Number(param(p, "startupWaitMs", 250)), 1000));
 try {
  await waitForChromePage(port, { ...p, url, timeoutMs:timeoutOf(p, 15000) });
 } catch (error) {
  if (param(p, "cleanupOnFailure", true) !== false) {
   await ChromeProcesses.stopOwned({ port, pid:proc.pid, force:true }).catch(() => {});
  }
  throw error;
 }
 return { ok:true, action:"chromeLaunch", chromePath, port, pid:proc.pid, userDataDir, headless, persist, argsCount:args.length, url, logs:readCompactLogs(p) };
}
async function chromeStop(p = {}) {
 cdp.closeCurrent("Chrome stop requested.");
 return ChromeProcesses.stopOwned(p);
}
async function chromeStatus(p = {}) { const { config, port } = chromeConfig(p, "chromeStatus"); try { const info = await cdp.version(port), list = await cdp.pages(port); return { ok:true, action:"chromeStatus", connected:true, port, chromePath:config.chrome.path || findChrome(), headless:!!config.chrome.headless, info:{ Browser:info.Browser, ProtocolVersion:info.ProtocolVersion, webSocketDebuggerUrl:Boolean(info.webSocketDebuggerUrl) }, pageCount:list.length, pages:list.map(targetView).slice(0, Number(param(p, "maxPages", 10))), targetLeases:cdp.targetLeaseSnapshot(), logs:readCompactLogs(p) }; } catch (e) { return { ok:true, action:"chromeStatus", connected:false, port, chromePath:config.chrome.path || findChrome(), ...chromeFindDetails(), error:e.message, logs:readCompactLogs(p) }; } }
async function chromeTargets(p = {}) { const { blocked, port } = chromeConfig(p, "chromeTargets"); if (blocked) return blocked; const list = await cdp.pages(port); return { ok:true, action:"chromeTargets", port, count:list.length, targets:list.map(targetView), targetLeases:cdp.targetLeaseSnapshot() }; }
async function chromeNewPage(p = {}) { const { blocked, port } = chromeConfig(p, "chromeNewPage"); if (blocked) return blocked; const url = urlOf(p), target = await cdp.newPage(port, url), lease = cdp.leaseTarget(target.id, targetOptions(p)); await cdp.ensurePage(port, { ...targetOptions(p), pageId:target.id, forceReconnect:true, url }); return { ok:true, action:"chromeNewPage", port, target:targetView(target), chromeTargetId:target.id, pageId:target.id, lease }; }
async function chromeClosePage(p = {}) { const { blocked, port } = chromeConfig(p, "chromeClosePage"); if (blocked) return blocked; const targetId = param(p, "chromeTargetId", param(p, "pageId", param(p, "targetId", ""))); if (!targetId) return { ok:false, action:"chromeClosePage", error:"missing_chromeTargetId" }; const lease = cdp.targetLease(targetId); if (lease && !lease.shared && !leaseMatches(lease, p) && p.force !== true) return { ok:false, action:"chromeClosePage", error:"target_lease_mismatch", chromeTargetId:targetId, lease }; const closed = await cdp.closePage(port, targetId); cdp.releaseTarget(targetId); return { ok:true, action:"chromeClosePage", port, chromeTargetId:targetId, closed, released:true }; }
async function chromeCloseTabs(p = {}) { const { blocked, port } = chromeConfig(p, "chromeCloseTabs"); if (blocked) return blocked; const list = await cdp.pages(port), keep = Math.max(0, Number(param(p, "keep", 0))), rx = closePattern(p); const matches = list.filter(t => t.type === "page" && rx.test(String(t.url || "") + " " + String(t.title || ""))).filter(t => p.force === true || cdp.canUseTarget(t.id, targetOptions(p))); const toClose = matches.slice(0, Math.max(0, matches.length - keep)); const closed = []; for (const t of toClose) { await cdp.closePage(port, t.id).catch(e => ({ ok:false, error:e.message })); cdp.releaseTarget(t.id); closed.push(targetView(t)); } return { ok:true, action:"chromeCloseTabs", port, pattern:String(rx), found:matches.length, closedCount:closed.length, closed }; }
function closePattern(p = {}) { if (p.chatgpt || p.chatgptOnly) return /https?:\/\/(chatgpt\.com|chat\.openai\.com)\b/i; if (param(p, "urlPattern")) return new RegExp(String(param(p, "urlPattern")), p.flags || "i"); if (urlOf(p, "")) return new RegExp(escapeRegExp(urlOf(p, "").replace(/[#?].*$/, "")), "i"); return /^about:blank/i; }
async function chromeNavigate(p = {}) { const { blocked, port } = chromeConfig(p, "chromeNavigate"); if (blocked) return blocked; if (param(p, "clearLogs", true) !== false) readChromeLogs({ clear:true }); const url = urlOf(p), timeout = timeoutOf(p, 30000), options = targetOptions(p); const nav = await cdp.navigateAndWait(url, timeout, port, options); const waitMs = Number(param(p, "waitMs", 0)); if (waitMs > 0) await wait(Math.min(waitMs, 30000)); const out = { ok:nav.ok !== false, action:"chromeNavigate", url, port, navigation:nav, chromeTargetId:nav.chromeTargetId || options.chromeTargetId, target:options, logs:readCompactLogs(p) }; if (out.ok === false) out.diagnostics = await navigationDiagnostics(port, p, nav); if (param(p, "snapshot", false) === true) out.snapshot = await pageSnapshot({ ...p, maxText:Math.min(Number(param(p, "maxText", 1200)), 3000), maxLogs:20 }); return out; }
async function chromeEval(p = {}) { const { blocked, port } = chromeConfig(p, "chromeEval"); if (blocked) return blocked; await cdp.ensurePage(port, { ...targetOptions(p), timeoutMs:timeoutOf(p, 10000) }); const expression = expressionOf(p); try { const result = await cdp.cdpCall("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutOf(p)); return { ok:true, action:"chromeEval", expression:compactExpression(expression), target:targetOptions(p), result:compactRemoteResult(result, Number(param(p, "maxValueChars", param(p, "maxChars", 12000)))), logs:readCompactLogs(p) }; } catch (e) { return { ok:false, action:"chromeEval", error:e.message, expression:compactExpression(expression), target:targetOptions(p), logs:readCompactLogs(p) }; } }
async function chromeWaitForSelector(p = {}) { const { blocked, port } = chromeConfig(p, "chromeWaitForSelector"); if (blocked) return blocked; await cdp.ensurePage(port, { ...targetOptions(p), timeoutMs:timeoutOf(p, 10000) }); const selector = param(p, "selector", ""), timeout = timeoutOf(p, 10000); if (!selector) return { ok:false, action:"chromeWaitForSelector", error:"missing_selector" }; const start = Date.now(); while (Date.now() - start < timeout) { const r = await cdp.cdpCall("Runtime.evaluate", { expression:"!!document.querySelector(" + JSON.stringify(selector) + ")", returnByValue:true }, Math.min(timeout, 5000)); if (r.result?.value) return { ok:true, action:"chromeWaitForSelector", selector, found:true, durationMs:Date.now() - start, target:targetOptions(p) }; await wait(250); } return { ok:false, action:"chromeWaitForSelector", selector, found:false, timeout, target:targetOptions(p), logs:readCompactLogs(p) }; }
async function chromeClick(p = {}) { return await evalElementAction("chromeClick", p, `el.scrollIntoView({block:"center",inline:"center"}); el.click(); return {ok:true,text:el.innerText||el.value||el.getAttribute("aria-label")||""};`); }
async function chromeType(p = {}) { const text = param(p, "text", ""); return await evalElementAction("chromeType", p, `el.focus(); el.value=${JSON.stringify(text)}; el.dispatchEvent(new Event("input",{bubbles:true})); el.dispatchEvent(new Event("change",{bubbles:true})); return {ok:true,value:el.value};`, { textLength:text.length }); }
async function evalElementAction(action, p, body, extra = {}) { const { blocked, port } = chromeConfig(p, action); if (blocked) return blocked; await cdp.ensurePage(port, { ...targetOptions(p), timeoutMs:timeoutOf(p, 10000) }); const selector = param(p, "selector", ""); if (!selector) return { ok:false, action, error:"missing_selector" }; const expression = `(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) return {ok:false,error:"not_found"}; ${body} })()`; const result = await cdp.cdpCall("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutOf(p)); return { ok:true, action, selector, target:targetOptions(p), ...extra, result:compactRemoteResult(result, Number(param(p, "maxValueChars", 8000))), logs:readCompactLogs(p) }; }
async function chromeLogs(p = {}) { return { ok:true, action:"chromeLogs", ...readCompactLogs({ ...p, maxLogs:p.maxLogs ?? 40 }) }; }
async function chromeSnapshot(p = {}) { const { blocked, port } = chromeConfig(p, "chromeSnapshot"); if (blocked) return blocked; await cdp.ensurePage(port, { ...targetOptions(p), timeoutMs:timeoutOf(p, 10000) }); return { ok:true, action:"chromeSnapshot", target:targetOptions(p), ...(await pageSnapshot({ ...p, maxText:Math.min(Number(p.maxText || 3000), 8000), maxLogs:40 })) }; }
async function chromeScreenshot(p = {}) { const { blocked, port } = chromeConfig(p, "chromeScreenshot"); if (blocked) return blocked; await cdp.ensurePage(port, { ...targetOptions(p), timeoutMs:timeoutOf(p, 10000) }); const format = p.format === "png" ? "png" : "jpeg", quality = format === "jpeg" ? Math.max(1, Math.min(Number(p.quality || 70), 100)) : undefined; const params = { format, fromSurface:p.fromSurface !== false, captureBeyondViewport:p.captureBeyondViewport === true }; if (quality) params.quality = quality; const result = await cdp.cdpCall("Page.captureScreenshot", params, timeoutOf(p, 20000)); const data = result.data || ""; return { ok:true, action:"chromeScreenshot", target:targetOptions(p), contentType:"image/" + format, format, bytes:data.length, frame64:data, logs:readCompactLogs(p) }; }
async function chromeRunScript(p = {}) { const steps = Array.isArray(p.script) ? p.script : [], results = []; const dispatch = { goto:s => chromeNavigate({ ...p, ...s, url:s.url }), navigate:s => chromeNavigate({ ...p, ...s, url:s.url }), waitForSelector:s => chromeWaitForSelector({ ...p, ...s }), click:s => chromeClick({ ...p, ...s }), type:s => chromeType({ ...p, ...s }), eval:s => chromeEval({ ...p, ...s, expression:s.expression || "document.title" }), logs:s => chromeLogs({ ...p, ...s }), snapshot:s => chromeSnapshot({ ...p, ...s }), screenshot:s => chromeScreenshot({ ...p, ...s }), closeTabs:s => chromeCloseTabs({ ...p, ...s }) }; for (const step of steps) results.push(dispatch[step.type || step.action] ? await dispatch[step.type || step.action](step) : { ok:false, error:"unknown_step", stepType:step.type || step.action }); return { ok:results.every(x => x.ok !== false), action:"chromeRunScript", count:steps.length, results:results.slice(0, Number(p.maxStepResults || 25)), logs:readCompactLogs(p) }; }
function targetOptions(p = {}) { return { pageId:param(p, "pageId", param(p, "chromeTargetId", param(p, "targetId", ""))), chromeTargetId:param(p, "chromeTargetId", param(p, "pageId", param(p, "targetId", ""))), browserSessionId:param(p, "browserSessionId", ""), roomId:param(p, "roomId", ""), missionId:param(p, "missionId", ""), agentSessionId:param(p, "agentSessionId", ""), logicalAgentId:param(p, "logicalAgentId", ""), shared:p.shared === true, inspectShared:p.inspectShared === true, force:p.force === true }; }
function targetView(t = {}) { const lease = cdp.targetLease(t.id); return { id:t.id, chromeTargetId:t.id, title:String(t.title || "").slice(0, 120), url:String(t.url || "").slice(0, 300), type:t.type, attached:Boolean(t.webSocketDebuggerUrl), lease }; }
function leaseMatches(lease = {}, p = {}) { const o = targetOptions(p); return [lease.browserSessionId, lease.roomId, lease.missionId, lease.agentSessionId, lease.logicalAgentId].every((v, i) => !v || v === [o.browserSessionId, o.roomId, o.missionId, o.agentSessionId, o.logicalAgentId][i]); }
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
async function navigationDiagnostics(port, payload, navigation) { let targets = []; try { targets = (await cdp.pages(port)).map(targetView); } catch (_) {} return { navigation, currentTargets:targets.slice(0, 20), logs:readCompactLogs({ ...payload, maxLogs:80 }), suggestedNextAction:{ action:"chromeDoctor", port, url:payload.url || "", chromeTargetId:payload.chromeTargetId || payload.pageId || "" } }; }
module.exports = { chromeFind, chromeLaunch, chromeStop, chromeStatus, chromeTargets, chromeNewPage, chromeClosePage, chromeCloseTabs, chromeTargetSelector:chromeTargets, chromeNavigate, chromeEval, chromeWaitForSelector, chromeClick, chromeType, chromeLogs, chromeSnapshot, chromeScreenshot, chromeRunScript, targetOptions, targetView, leaseMatches, param, urlOf, expressionOf, waitForChromePage };
