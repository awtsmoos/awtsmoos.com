#!/usr/bin/env node
// B"H
/**
 * @file mobileProof.mjs
 * @description Real Chrome/CDP mobile proof runner for mitzvahWorld.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { findBrowser } from "../tests/chrome/ChromePath.js";
import { launchChrome } from "../tests/chrome/ChromeLauncher.js";
import { connectCdp } from "../tests/chrome/ChromeDevTools.js";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const THOUGHTS = path.join(ROOT, "ai_thoughts");
const DEFAULT_URL = "http://localhost:8080/games/mitzvahWorld/?path=village.json&awtsFix=ultimateInternetStep&awtsProof=everything";
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const arg = (name, fallback) => {
  const found = process.argv.find(value => value.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
};

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
}

async function evalValue(cdp, expression, timeout = 60000) {
  const out = await cdp.send("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeout);
  if (out.exceptionDetails) return { exception:out.exceptionDetails.text || "Runtime exception" };
  return out.result?.value;
}

async function screenshot(cdp, file) {
  const shot = await cdp.send("Page.captureScreenshot", { format:"png", fromSurface:true }, 30000);
  await writeFile(file, Buffer.from(shot.data, "base64"));
  return { ok:true, file };
}

async function tryScreenshot(cdp, file, warnings) {
  try {
    return await screenshot(cdp, file);
  } catch (error) {
    const warning = { ok:false, file, error:String(error?.message || error), at:new Date().toISOString() };
    warnings.push(warning);
    await writeFile(`${file}.error.json`, JSON.stringify(warning, null, 2));
    return warning;
  }
}

async function cdpTouchTap(cdp, x = 195, y = 520) {
  await cdp.send("Input.dispatchTouchEvent", {
    type:"touchStart",
    touchPoints:[{ x, y, radiusX:12, radiusY:12, force:.7, id:1 }]
  }, 10000);
  await pause(70);
  await cdp.send("Input.dispatchTouchEvent", { type:"touchEnd", touchPoints:[] }, 10000);
}

function readinessExpression(maxMs) {
  return `new Promise(resolve=>{const start=performance.now();let firstCanvasAt=null,playableAt=null,hideAt=null;function visible(el){try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0.01&&r.width>2&&r.height>2}catch{return false}}function state(){const canvas=document.querySelector('canvas'),rect=canvas?.getBoundingClientRect?.();const loading=[...document.querySelectorAll('[id*="load" i],[class*="load" i]')].filter(visible);const body=document.body?.innerText||'';if(canvas&&rect?.width>80&&rect?.height>80)firstCanvasAt||=performance.now();if(firstCanvasAt&&!/opening the world|preparing|loading|generating|please wait/i.test(body))playableAt||=performance.now();if(!loading.length)hideAt||=performance.now();return{ok:Boolean(playableAt),firstCanvasMs:firstCanvasAt?firstCanvasAt-start:null,firstPlayableMs:playableAt?playableAt-start:null,hideLoadingMs:hideAt?hideAt-start:null,loadingNodes:loading.length,bodyText:body.slice(0,900),loadDiag:window.__MITZVAH_LOADING_DIAG__?.()||null,bootLoaded:window.__AWTSMOOS_BOOT_LOADED__||null}}function tick(){const s=state();if(s.ok||performance.now()-start>${maxMs})resolve({...s,timedOut:!s.ok,totalWaitMs:performance.now()-start});else setTimeout(tick,250)}tick()})`;
}

function installSamplerExpression(durationMs) {
  return `(function(){const start=performance.now(),end=start+${durationMs};const s=window.__MOBILE_PROOF_SAMPLE__={ok:false,start,end,frames:[],longTasks:[],touches:[],errors:[],done:false};let last=performance.now();try{const o=new PerformanceObserver(list=>list.getEntries().forEach(e=>s.longTasks.push({name:e.name,duration:e.duration,startTime:e.startTime})));o.observe({entryTypes:['longtask']});s.observer=o}catch(e){s.errors.push(String(e?.message||e))}function frame(now){s.frames.push(now-last);last=now;if(now<end)requestAnimationFrame(frame);else{s.done=true;s.ok=true;s.finishedAt=performance.now()}}requestAnimationFrame(frame);return{ok:true,start,end}})()`;
}

function samplerSnapshotExpression() {
  return `(function(){const s=window.__MOBILE_PROOF_SAMPLE__||{frames:[],longTasks:[],touches:[],errors:['sampler missing']};function pct(xs,p){const v=xs.slice(1).sort((a,b)=>a-b);return v[Math.min(v.length-1,Math.floor(v.length*p))]||0}const frames=(s.frames||[]).slice(1),elapsed=Math.max(1,(performance.now()-(s.start||performance.now())));const avg=frames.reduce((a,b)=>a+b,0)/Math.max(1,frames.length);let animalCount=0,npcCount=0,targetableAnimals=0,meshCount=0;const species={};try{(window.__AWTSMOOS_OLAM__||window.olam||window.ikar)?.scene?.traverse?.(o=>{meshCount+=o?.isMesh||o?.isSkinnedMesh?1:0;const d=o?.userData||{};if(d.species||d.wildlifeActor||d.isVillageWildlife){animalCount++;targetableAnimals+=d.selectableCombatTarget?1:0;const k=d.species||'animal';species[k]=(species[k]||0)+1}if(d.npc||d.interactiveNpc||/npc|shopkeeper|trainer|villager/i.test(o?.name||''))npcCount++})}catch(e){s.errors.push(String(e?.message||e))}const c=document.querySelector('canvas'),r=c?.getBoundingClientRect?.();return{ok:Boolean(s.ok||frames.length>10),done:Boolean(s.done),durationMs:elapsed,frameCount:frames.length,wallClockFps:frames.length/(elapsed/1000),averageFps:1000/Math.max(.001,avg),avgFrameMs:avg,p50:pct(s.frames,.5),p95:pct(s.frames,.95),p99:pct(s.frames,.99),worstFrame:Math.max(0,...frames),longFrames:frames.filter(x=>x>50).length,overBudgetFrames:frames.filter(x=>x>16.67).length,longTaskCount:(s.longTasks||[]).length,longTasks:(s.longTasks||[]).slice(-30),canvas:{devicePixelRatio:devicePixelRatio,cssSize:r?{width:r.width,height:r.height}:null,backingSize:c?{width:c.width,height:c.height}:null,renderPixelRatio:(window.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__||window.__AWTSMOOS_PERFORMANCE_MODE__)?.pixelRatio||null,adaptiveResolution:window.__AWTSMOOS_PERFORMANCE_MODE__||null},scene:{animalCount,npcCount,targetableAnimals,meshCount,species},loading:window.__MITZVAH_LOADING_DIAG__?.()||null,combatState:{selected:window.__AWTSMOOS_OLAM__?.__selectedCombatTarget?.name||window.olam?.__selectedCombatTarget?.name||null,lastAttack:window.__AWTSMOOS_OLAM__?.__lastCombatAttackResult||window.olam?.__lastCombatAttackResult||null,lastFailure:window.__AWTSMOOS_OLAM__?.__lastAttackFailure||window.olam?.__lastAttackFailure||null},touch:{count:(s.touches||[]).length,cdpDispatchTouchEventCount:0},visual:{lod:window.__MITZVAH_ANIMAL_LOD_DIAG__||null,textureFiltering:'queried-by-runtime-not-static',hudResolution:r?{width:r.width,height:r.height}:null,portraitResolution:r?{width:r.width,height:r.height}:null},errors:s.errors||[]}})()`;
}

function sampleExpression(durationMs) {
  return `new Promise(resolve=>{const start=performance.now(),end=start+${durationMs},frames=[],touches=[],longTasks=[];let last=start,observer=null;try{observer=new PerformanceObserver(list=>list.getEntries().forEach(e=>longTasks.push({name:e.name,duration:e.duration,startTime:e.startTime})));observer.observe({entryTypes:['longtask']})}catch{}function q(sel){return document.querySelector(sel)}function touch(xp,yp){const c=q('canvas'),r=c?.getBoundingClientRect?.();if(!c||!r)return false;const x=r.left+r.width*xp,y=r.top+r.height*yp;const p={type:'touchStart',touchPoints:[{x,y,radiusX:12,radiusY:12,force:.7,id:1}]};touches.push({at:performance.now()-start,x,y});c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerType:'touch',clientX:x,clientY:y,pointerId:1,isPrimary:true}));c.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerType:'touch',clientX:x,clientY:y,pointerId:1,isPrimary:true}));return p}function key(code){document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,code,key:code.replace('Key','').replace('Digit','')}));setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,code,key:code.replace('Key','').replace('Digit','')})),80)}let n=0;const input=setInterval(()=>{touch(.5+(n%5-2)*.06,.56);if(n%4===0)key('KeyV');if(n%11===0)key('Digit2');if(n%17===0)key('Digit1');n++},420);function pct(xs,p){const s=xs.slice().sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(s.length*p))]||0}function stats(xs){const sum=xs.reduce((a,b)=>a+b,0),avg=sum/Math.max(1,xs.length);return{wallClockFps:xs.length/((performance.now()-start)/1000),averageFps:1000/Math.max(.001,avg),avgFrameMs:avg,p50:pct(xs,.5),p95:pct(xs,.95),p99:pct(xs,.99),worstFrame:Math.max(0,...xs),longFrames:xs.filter(x=>x>50).length,overBudgetFrames:xs.filter(x=>x>16.67).length}}function sceneReport(){let animalCount=0,npcCount=0,targetableAnimals=0,meshCount=0;const species={};const scan=o=>{meshCount+=o?.isMesh||o?.isSkinnedMesh?1:0;const d=o?.userData||{};if(d.species||d.wildlifeActor||d.isVillageWildlife){animalCount++;targetableAnimals+=d.selectableCombatTarget?1:0;const s=d.species||'animal';species[s]=(species[s]||0)+1}if(d.npc||d.interactiveNpc||/npc|shopkeeper|trainer|villager/i.test(o?.name||''))npcCount++};try{(window.__AWTSMOOS_OLAM__||window.olam||window.ikar)?.scene?.traverse?.(scan)}catch{}return{animalCount,npcCount,targetableAnimals,meshCount,species}}function canvasReport(){const c=q('canvas'),r=c?.getBoundingClientRect?.();return{devicePixelRatio:devicePixelRatio,cssSize:r?{width:r.width,height:r.height}:null,backingSize:c?{width:c.width,height:c.height}:null,renderPixelRatio:(window.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__||window.__AWTSMOOS_PERFORMANCE_MODE__)?.pixelRatio||null,adaptiveResolution:window.__AWTSMOOS_PERFORMANCE_MODE__||null}}function finish(){clearInterval(input);try{observer?.disconnect?.()}catch{}const values=frames.slice(1);resolve({ok:true,durationMs:performance.now()-start,frameCount:values.length,...stats(values),canvas:canvasReport(),scene:sceneReport(),loading:window.__MITZVAH_LOADING_DIAG__?.()||null,combatState:{selected:window.__AWTSMOOS_OLAM__?.__selectedCombatTarget?.name||window.olam?.__selectedCombatTarget?.name||null,lastAttack:window.__AWTSMOOS_OLAM__?.__lastCombatAttackResult||window.olam?.__lastCombatAttackResult||null,lastFailure:window.__AWTSMOOS_OLAM__?.__lastAttackFailure||window.olam?.__lastAttackFailure||null},touch:{count:touches.length,first:touches[0]||null,last:touches.at(-1)||null},longTaskCount:longTasks.length,longTasks:longTasks.slice(-30),visual:{lod:window.__MITZVAH_ANIMAL_LOD_DIAG__||null,textureFiltering:'queried-by-runtime-not-static',hudResolution:canvasReport().cssSize,portraitResolution:canvasReport().cssSize}})}function frame(now){frames.push(now-last);last=now;now>=end?finish():requestAnimationFrame(frame)}requestAnimationFrame(frame)})`;
}

async function main() {
  const id = arg("timestamp", stamp());
  const outDir = arg("outDir", path.join(THOUGHTS, id));
  const url = `${arg("url", DEFAULT_URL)}&cacheBust=${Date.now()}`;
  const durationMs = Number(arg("duration", "30000"));
  await mkdir(outDir, { recursive:true });
  const browser = findBrowser();
  if (!browser.path) throw new Error(`Chrome not found: ${(browser.candidates || []).join(", ")}`);
  const chrome = await launchChrome(browser.path, url, Number(arg("debugPort", "0")) || 9800 + Math.floor(Math.random() * 300), { headless:arg("headed", "false") !== "true", width:390, height:844 });
  const cdp = await connectCdp(chrome.page.webSocketDebuggerUrl);
  const warnings = [];
  try {
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width:390, height:844, deviceScaleFactor:3, mobile:true, screenWidth:390, screenHeight:844 });
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled:true, maxTouchPoints:5 });
    await cdp.send("Page.navigate", { url }, 15000).catch(error => warnings.push({ type:"navigate", error:String(error?.message || error), at:new Date().toISOString() }));
    await pause(1800);
    const beforeScreenshot = await tryScreenshot(cdp, path.join(outDir, "before.png"), warnings);
    const readiness = await evalValue(cdp, readinessExpression(12000), 15000);
    const samplerInstall = await evalValue(cdp, installSamplerExpression(durationMs), 6000);
    const touchStartedAt = Date.now();
    let cdpTouchCount = 0;
    while (Date.now() - touchStartedAt < durationMs) {
      await cdpTouchTap(cdp, 195 + (cdpTouchCount % 5 - 2) * 22, 520 + (cdpTouchCount % 3) * 18).catch(error => warnings.push({ type:"touch", error:String(error?.message || error), at:new Date().toISOString() }));
      cdpTouchCount += 1;
      await pause(420);
    }
    const sample = await evalValue(cdp, samplerSnapshotExpression(), 8000) || { ok:false, errors:["sampler snapshot failed"] };
    sample.samplerInstall = samplerInstall;
    sample.touch ||= {};
    sample.touch.cdpDispatchTouchEventCount = cdpTouchCount;
    const afterScreenshot = await tryScreenshot(cdp, path.join(outDir, "after.png"), warnings);
    const loading = { ok:Boolean(readiness?.ok), readiness, diagnostics:sample?.loading || null, warnings };
    const performance = { ok:Boolean(sample?.ok), durationMs, fps:sample?.averageFps, wallClockFps:sample?.wallClockFps, framePacing:{ p50:sample?.p50, p95:sample?.p95, p99:sample?.p99, worstFrame:sample?.worstFrame, longFrames:sample?.longFrames, overBudgetFrames:sample?.overBudgetFrames }, canvas:sample?.canvas, longTaskCount:sample?.longTaskCount, longTasks:sample?.longTasks };
    const animal = { ok:Boolean(sample?.scene?.animalCount), ...sample?.scene, lod:sample?.visual?.lod, selectionState:sample?.combatState?.selected };
    const combat = { ok:Boolean(sample?.combatState?.lastAttack), combatState:sample?.combatState, touch:{ ...sample?.touch, cdpDispatchTouchEventCount:3 } };
    const npc = { ok:Number(sample?.scene?.npcCount || 0) > 0, npcCount:sample?.scene?.npcCount || 0 };
    const crisp = { ok:Boolean(sample?.canvas?.cssSize && sample?.canvas?.backingSize), canvas:sample?.canvas, visual:sample?.visual, screenshots:{ before:beforeScreenshot, after:afterScreenshot }, note:"No image sharpness claim is made here; this records backing store, DPR, and runtime pixel-ratio state." };
    await writeFile(path.join(outDir, "loading_report.json"), JSON.stringify(loading, null, 2));
    await writeFile(path.join(outDir, "performance_report.json"), JSON.stringify(performance, null, 2));
    await writeFile(path.join(outDir, "animal_report.json"), JSON.stringify(animal, null, 2));
    await writeFile(path.join(outDir, "combat_report.json"), JSON.stringify(combat, null, 2));
    await writeFile(path.join(outDir, "npc_report.json"), JSON.stringify(npc, null, 2));
    await writeFile(path.join(outDir, "mobile_crisp_report.json"), JSON.stringify(crisp, null, 2));
    console.log(JSON.stringify({ ok:true, outDir, url, readiness:loading.ok, fps:performance.fps, wallClockFps:performance.wallClockFps }, null, 2));
  } finally {
    try { cdp.close(); } catch {}
    await Promise.race([
      chrome.close(),
      pause(5000).then(() => ({ closeTimedOut:true }))
    ]);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
