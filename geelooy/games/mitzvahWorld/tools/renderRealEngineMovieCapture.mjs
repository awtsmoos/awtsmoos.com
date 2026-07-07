// B"H
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { findBrowser } from "../tests/chrome/ChromePath.js";
import { launchChrome } from "../tests/chrome/ChromeLauncher.js";
import { connectCdp } from "../tests/chrome/ChromeDevTools.js";

const args = Object.fromEntries(process.argv.slice(2).map(arg => { const [k,...v]=arg.replace(/^--/,"").split("="); return [k, v.join("=") || true]; }));
const seconds = Number(args.seconds || 60);
const fps = Number(args.fps || 8);
const frameCount = Math.max(1, Math.floor(seconds * fps));
const base = String(args.url || process.env.MITZVAH_WORLD_URL || "http://127.0.0.1:8080/games/mitzvahWorld/");
const url = `${base}?compact=true&path=village.json&awtsMovieCapture=real-3d-actions-${Date.now()}`;
const out = String(args.out || "/Users/awtsmoos/Documents/awtsmoos/movie-renders/mitzvahWorld/real-engine-3d-actions-60s.mp4");
const proofDir = String(args.proofDir || "ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/real-engine-movie");
const frameDir = `${proofDir}/frames`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(frameDir, { recursive:true });
rmSync(frameDir, { recursive:true, force:true });
mkdirSync(frameDir, { recursive:true });
async function ev(client, expression, timeoutMs=30000) {
  const r = await client.send("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutMs);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || "eval failed");
  return r.result?.value;
}
async function waitPlayable(client) {
  for (let i = 0; i < 200; i++) {
    const p = await ev(client, `(()=>{const c=document.querySelector('canvas'),h=window.__AWTSMOOS_PLAYER_FACING_HUD_GUARANTEE__?.has?.();return{ok:!!(c&&h?.health&&h?.targeting&&h?.quest),hidden:!document.getElementById('awtsmoosLoadingVeil'),w:c?.width,h:c?.height,manager:!!(window.__AWTSMOOS_ACTIVE_WORKER_MANAGER__||window.__AWTSMOOS_MANAGER__?.socket)}})()`).catch(e => ({ ok:false, error:String(e.message || e) }));
    if (p.ok && p.hidden && p.manager) return p;
    await sleep(500);
  }
  throw new Error("playable real-3d worker timeout");
}
function actionForFrame(frame) {
  const phase = Math.floor(frame / Math.max(1, fps * 5)) % 6;
  return ["walk", "run", "jump", "talk", "punch", "stab"][phase];
}
async function drive3DActions(client, frame) {
  const action = actionForFrame(frame);
  return await ev(client, `(()=>{
    const action=${JSON.stringify(action)}, frame=${frame};
    const manager=window.__AWTSMOOS_ACTIVE_WORKER_MANAGER__||window.__AWTSMOOS_MANAGER__?.socket;
    const forward=action==='walk'||action==='run';
    manager?.postMessage?.({ movie3DAction:{ action, loop:action!=='jump', timeScale:action==='run'?1.18:1, id:'movie3d-'+frame } });
    manager?.postMessage?.({ mobileMove:{ FORWARD:forward, BACKWARD:false, LEFT_STRIDE:false, RIGHT_STRIDE:false, source:'real-3d-movie-capture', seal:'real-3d-actions' } });
    manager?.postMessage?.({ playerProbe:{ id:'movie3d-probe-'+frame, seal:'real-3d-actions' } });
    function key(code,type='keydown'){const e=new KeyboardEvent(type,{bubbles:true,cancelable:true,code,key:code.replace('Key','').replace('Digit','')});window.dispatchEvent(e);document.dispatchEvent(e);document.querySelector('canvas')?.dispatchEvent(e)}
    if(forward) key('KeyW'); else key('KeyW','keyup');
    if(action==='run') key('ShiftLeft'); else key('ShiftLeft','keyup');
    if(action==='jump'&&frame%8===0) key('Space');
    if((action==='punch'||action==='stab')&&frame%10===0) key('KeyX');
    return { action, frame, requested:true, real3DOnly:true, overlay:false };
  })()`);
}
function writePng(i, data) {
  const path = `${frameDir}/frame_${String(i).padStart(5,"0")}.png`;
  writeFileSync(path, Buffer.from(data, "base64"));
  return path;
}
async function sampleProbe(client) {
  return await ev(client, `(()=>window.__AWTSMOOS_LAST_PLAYER_PROBE__||null)()`).catch(() => null);
}
function probeClipName(sample) { return sample?.animation?.currentClip || sample?.payload?.animation?.currentClip || null; }
const browser = findBrowser();
if (!browser.path) throw new Error("No Chrome found");
const chrome = await launchChrome(browser.path, url, 9245, { width:1280, height:720 });
const events = [];
try {
  const client = await connectCdp(chrome.page.webSocketDebuggerUrl, e => events.push(e));
  await client.send("Runtime.enable");
  await client.send("Network.enable");
  await client.send("Page.enable");
  const playable = await waitPlayable(client);
  const samples = [];
  const probeSamples = [];
  for (let i = 0; i < frameCount; i++) {
    const d = await drive3DActions(client, i);
    if (i % fps === 0) samples.push(d);
    await sleep(1000 / fps);
    if (i % Math.max(1, fps) === 0) probeSamples.push(await sampleProbe(client));
    const png = await client.send("Page.captureScreenshot", { format:"png", captureBeyondViewport:false }, 15000);
    writePng(i, png.data);
  }
  await ev(client, `(()=>{const m=window.__AWTSMOOS_ACTIVE_WORKER_MANAGER__||window.__AWTSMOOS_MANAGER__?.socket;m?.postMessage?.({mobileMove:{FORWARD:false,BACKWARD:false,LEFT_STRIDE:false,RIGHT_STRIDE:false,source:'real-3d-movie-capture-stop'}});['KeyW','ShiftLeft','Space','KeyX'].forEach(c=>{const e=new KeyboardEvent('keyup',{bubbles:true,cancelable:true,code:c,key:c});window.dispatchEvent(e);document.dispatchEvent(e);document.querySelector('canvas')?.dispatchEvent(e)});return true})()`);
  const fatal = events.filter(e => e.method === "Runtime.exceptionThrown" || e.method === "Network.loadingFailed");
  const ff = spawnSync("ffmpeg", ["-y", "-framerate", String(fps), "-i", `${frameDir}/frame_%05d.png`, "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { encoding:"utf8" });
  if (ff.status !== 0) throw new Error(`ffmpeg failed\n${ff.stderr}`);
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-count_frames", "-print_format", "json", out], { encoding:"utf8" });
  if (probe.status !== 0) throw new Error(`ffprobe failed\n${probe.stderr}`);
  const clipNames = [...new Set(probeSamples.map(probeClipName).filter(Boolean))];
  const report = { ok:true, realEngineCapture:true, synthetic:false, overlay:false, real3DOnly:true, url, output:out, absoluteOutput:resolve(out), seconds, fps, frameCount, playable, samples, probeSamples, observedClipNames:clipNames, fatalConsoleOrNetwork:fatal.length, ffprobe:JSON.parse(probe.stdout) };
  writeFileSync(`${proofDir}/realEngineMovieCapture.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  client.close?.();
} finally {
  await chrome.close();
}
