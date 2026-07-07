// B"H
import { writeFileSync } from "node:fs";
import { findBrowser } from "./ChromePath.js";
import { launchChrome } from "./ChromeLauncher.js";
import { connectCdp } from "./ChromeDevTools.js";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const url=`${process.env.MITZVAH_WORLD_URL||"http://127.0.0.1:8080/games/mitzvahWorld/"}?compact=true&path=village.json&awtsProbe=movie-globals-${Date.now()}`;
async function ev(c,expression,timeoutMs=30000){const r=await c.send("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true},timeoutMs);if(r.exceptionDetails)throw new Error(r.exceptionDetails.text||"eval failed");return r.result?.value;}
const browser=findBrowser(); if(!browser.path) throw new Error("No Chrome");
const chrome=await launchChrome(browser.path,url,9247,{width:1280,height:720});
try{const client=await connectCdp(chrome.page.webSocketDebuggerUrl); await client.send("Runtime.enable"); await client.send("Page.enable");
 for(let i=0;i<120;i++){const ok=await ev(client,`!!(document.querySelector('canvas')&&!document.getElementById('awtsmoosLoadingVeil'))`).catch(()=>false); if(ok) break; await sleep(500);}
 const out=await ev(client,`(()=>{
  const keys=Object.keys(window).filter(k=>/olam|awts|three|scene|camera|player|ikar|world|movie|mitzvah/i.test(k)).slice(0,250);
  const vals={};
  for(const k of keys){try{const v=window[k]; vals[k]={type:typeof v, ctor:v?.constructor?.name, keys:v&&typeof v==='object'?Object.keys(v).slice(0,40):[]}}catch(e){}}
  function shortObj(o){if(!o||typeof o!=='object')return null; return {ctor:o.constructor?.name, keys:Object.keys(o).slice(0,60), pos:o.position?{x:o.position.x,y:o.position.y,z:o.position.z}:null, rot:o.rotation?{x:o.rotation.x,y:o.rotation.y,z:o.rotation.z}:null}}
  return {url:location.href, keys, vals, olam:shortObj(window.olam||window.__AWTSMOOS_OLAM__), player:shortObj((window.olam||window.__AWTSMOOS_OLAM__)?.player||window.__AWTSMOOS_PLAYER__), camera:shortObj((window.olam||window.__AWTSMOOS_OLAM__)?.camera||window.camera), scene:shortObj((window.olam||window.__AWTSMOOS_OLAM__)?.scene||window.scene), hud:window.__AWTSMOOS_PLAYER_FACING_HUD_GUARANTEE__?.has?.()};
 })()`);
 writeFileSync('ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/real-engine-movie/runtime-globals-probe.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify({ok:true, keys:out.keys.slice(0,80), olam:out.olam, player:out.player, camera:out.camera, scene:out.scene, hud:out.hud},null,2)); client.close?.();
}finally{await chrome.close();}
