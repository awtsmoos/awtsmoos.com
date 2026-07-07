// B"H
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { findBrowser } from "./ChromePath.js";
import { launchChrome } from "./ChromeLauncher.js";
import { connectCdp } from "./ChromeDevTools.js";

const proofDir = "ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof";
const base = process.env.MITZVAH_WORLD_URL || "http://127.0.0.1:8080/games/mitzvahWorld/";
const url = `${base}?compact=true&path=village.json&awtsAudit=hud-stability-${Date.now()}`;
const durationMs = Number(process.env.AWTS_STABILITY_MS || 30000);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function evalJs(client, expression, timeoutMs = 25000) {
  const result = await client.send("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutMs);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "runtime eval failed");
  return result.result?.value;
}

async function shot(client, name) {
  const out = await client.send("Page.captureScreenshot", { format:"png", captureBeyondViewport:false }, 15000);
  const file = `${proofDir}/${name}.png`;
  await writeFile(file, Buffer.from(out.data, "base64"));
  return file;
}

async function waitUntil(client, expression, timeoutMs = 45000) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < timeoutMs) {
    last = await evalJs(client, expression).catch(e => ({ ok:false, error:String(e.message || e) }));
    if (last?.ok) return last;
    await sleep(500);
  }
  return last || { ok:false, error:"timeout" };
}

const sampler = ms => `new Promise(resolve=>{const start=performance.now(),end=start+${ms};let last=start;const frames=[],longTasks=[],errors=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>longTasks.push({duration:e.duration,startTime:e.startTime}))).observe({entryTypes:['longtask']})}catch(e){errors.push(String(e?.message||e))}function key(code,type='keydown'){const e=new KeyboardEvent(type,{bubbles:true,cancelable:true,code,key:code.replace('Key','').replace('Digit','')});window.dispatchEvent(e);document.dispatchEvent(e);document.querySelector('canvas')?.dispatchEvent(e)}function click(xp=.5,yp=.5){const c=document.querySelector('canvas'),r=c?.getBoundingClientRect?.();if(!r)return;for(const t of ['mousemove','pointerdown','mousedown','pointerup','mouseup','click'])c.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,clientX:r.left+r.width*xp,clientY:r.top+r.height*yp,button:0,buttons:t.includes('down')?1:0}))}let n=0;const input=setInterval(()=>{key('KeyW','keydown');if(n%5===0)key('Space');if(n%7===0)key('KeyR');if(n%9===0)key('KeyX');if(n%4===0)click(.45+(n%5)*.03,.55);n++},260);function finish(){clearInterval(input);['KeyW','KeyA','KeyD','Space','KeyR','KeyX'].forEach(c=>key(c,'keyup'));const sorted=frames.slice(1).sort((a,b)=>a-b),sum=sorted.reduce((a,b)=>a+b,0),avg=sum/Math.max(1,sorted.length);const q=p=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))]||0;const hud=window.__AWTSMOOS_PLAYER_FACING_HUD_GUARANTEE__?.has?.()||{};const c=document.querySelector('canvas');resolve({ok:frames.length>30,frameCount:sorted.length,avgBrowserRafFps:1000/Math.max(.001,avg),minBrowserRafFps:1000/Math.max(.001,sorted.at(-1)||avg),p95FrameMs:q(.95),p99FrameMs:q(.99),longTaskCount:longTasks.length,longTasks:longTasks.slice(-20),hud,engineFps:window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__?.fps||null,loading:window.__MITZVAH_LOADING_DIAG__?.()?.loading||null,canvas:{width:c?.width||0,height:c?.height||0},errors})}function frame(now){frames.push(now-last);last=now;now>=end?finish():requestAnimationFrame(frame)}requestAnimationFrame(frame)})`;

await mkdir(proofDir, { recursive:true });
const browser = findBrowser();
if (!browser.path) throw new Error("No Chrome/Chromium browser found.");
const chrome = await launchChrome(browser.path, url, 9237, { width:390, height:844 });
const events = [];
try {
  const client = await connectCdp(chrome.page.webSocketDebuggerUrl, e => events.push(e));
  await client.send("Runtime.enable"); await client.send("Log.enable"); await client.send("Network.enable"); await client.send("Page.enable");
  await sleep(1500); const loadingShot = await shot(client, "01_loading_screen_mid_progress_or_early");
  const playable = await waitUntil(client, `(()=>{const c=document.querySelector('canvas'),hud=window.__AWTSMOOS_PLAYER_FACING_HUD_GUARANTEE__?.has?.();const hidden=!document.getElementById('awtsmoosLoadingVeil');return {ok:Boolean(c&&hidden&&hud?.health&&hud?.targeting&&hud?.x&&hud?.r&&hud?.quest),hidden,hud,loading:window.__MITZVAH_LOADING_DIAG__?.()?.loading||null}})()`, 80000);
  assert.equal(playable.ok, true, JSON.stringify(playable));
  const firstPlayableShot = await shot(client, "02_first_playable_hud_health_target_r_x_quest");
  const sample = await evalJs(client, sampler(durationMs), durationMs + 30000);
  const endShot = await shot(client, durationMs >= 120000 ? "10_two_minute_no_freeze_end_state" : "09_30_seconds_movement_proof");
  const fatal = events.filter(e => e.method === "Runtime.exceptionThrown" || e.method === "Network.loadingFailed");
  assert.equal(fatal.length, 0, JSON.stringify(fatal.slice(0, 5)));
  assert(sample.ok && sample.frameCount > 30, "rAF sampler did not run");
  for (const k of ["health","targeting","x","r","quest","joystick","jump"]) assert.equal(sample.hud[k], true, `HUD missing ${k}`);
  console.log(JSON.stringify({ ok:true, test:"hudLoadingStabilityScreenshotAudit", url, durationMs, screenshots:{ loadingShot, firstPlayableShot, endShot }, playable, sample, fatalConsoleOrNetwork:0 }, null, 2));
  client.close?.();
} finally { await chrome.close(); }
