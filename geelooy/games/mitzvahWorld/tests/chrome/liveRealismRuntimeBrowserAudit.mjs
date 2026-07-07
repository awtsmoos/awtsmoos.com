// B"H
import assert from "node:assert/strict";
import { findBrowser } from "./ChromePath.js";
import { launchChrome } from "./ChromeLauncher.js";
import { connectCdp } from "./ChromeDevTools.js";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const url = `${process.env.MITZVAH_WORLD_URL || "http://127.0.0.1:8080/games/mitzvahWorld/"}?compact=true&path=village.json&awtsAudit=live-realism-${Date.now()}`;
async function ev(client, expression) {
  const r = await client.send("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, 30000);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || "eval failed");
  return r.result?.value;
}
const browser = findBrowser();
if (!browser.path) throw new Error("No Chrome found");
const chrome = await launchChrome(browser.path, url, 9243, { width:390, height:844 });
const events = [];
try {
  const client = await connectCdp(chrome.page.webSocketDebuggerUrl, e => events.push(e));
  await client.send("Runtime.enable"); await client.send("Network.enable"); await client.send("Page.enable");
  let snap = null;
  for (let i = 0; i < 100; i++) {
    snap = await ev(client, `(()=>{const r=window.__MITZVAH_REALISM_RUNTIME_CONTRACT__;return {ok:!!r, r}})()`).catch(e => ({ ok:false, error:String(e.message||e) }));
    if (snap.ok) break;
    await sleep(400);
  }
  assert.equal(snap.ok, true, JSON.stringify(snap));
  assert(snap.r.npcSchedules.length >= 2, "live realism schedules missing");
  assert(snap.r.ambientZones.length >= 2, "live realism ambient zones missing");
  for (const flag of ["doorMemory","foliageWind","dayNightLighting","interiorLighting","wildlifeReactions","dialogueFacing","reducedInputLatency"]) assert(snap.r.flags.includes(flag), `missing live flag ${flag}`);
  const fatal = events.filter(e => e.method === "Runtime.exceptionThrown" || e.method === "Network.loadingFailed");
  assert.equal(fatal.length, 0, JSON.stringify(fatal.slice(0,5)));
  console.log(JSON.stringify({ ok:true, test:"liveRealismRuntimeBrowserAudit", url, schedules:snap.r.npcSchedules.length, ambientZones:snap.r.ambientZones.length, flags:snap.r.flags }, null, 2));
  client.close?.();
} finally { await chrome.close(); }
