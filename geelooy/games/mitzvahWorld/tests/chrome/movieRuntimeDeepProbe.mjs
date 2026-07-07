// B"H
import { writeFileSync } from "node:fs";
import { findBrowser } from "./ChromePath.js";
import { launchChrome } from "./ChromeLauncher.js";
import { connectCdp } from "./ChromeDevTools.js";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const url=`${process.env.MITZVAH_WORLD_URL||"http://127.0.0.1:8080/games/mitzvahWorld/"}?compact=true&path=village.json&awtsProbe=movie-deep-${Date.now()}`;
async function ev(c,e,t=30000){const r=await c.send("Runtime.evaluate",{expression:e,awaitPromise:true,returnByValue:true},t);if(r.exceptionDetails)throw new Error(r.exceptionDetails.text||"eval failed");return r.result?.value;}
const browser=findBrowser(); if(!browser.path) throw new Error("No Chrome");
const chrome=await launchChrome(browser.path,url,9248,{width:1280,height:720});
try{const client=await connectCdp(chrome.page.webSocketDebuggerUrl); await client.send("Runtime.enable"); await client.send("Page.enable");
 for(let i=0;i<150;i++){const ok=await ev(client,`!!(document.querySelector('canvas')&&!document.getElementById('awtsmoosLoadingVeil'))`).catch(()=>false); if(ok) break; await sleep(500);}
 const out=await ev(client,`(async()=>{
  function sobj(o,d=1){if(!o||typeof o!=='object')return null;let r={ctor:o.constructor?.name,keys:Object.keys(o).slice(0,80)}; if(o.position)r.position={x:o.position.x,y:o.position.y,z:o.position.z}; if(o.rotation)r.rotation={x:o.rotation.x,y:o.rotation.y,z:o.rotation.z}; if(d>0){for(const k of Object.keys(o).slice(0,25)){try{const v=o[k]; if(v&&typeof v==='object')r[k]={ctor:v.constructor?.name,keys:Object.keys(v).slice(0,25),pos:v.position?{x:v.position.x,y:v.position.y,z:v.position.z}:null}}catch(e){}}} return r;}
  let got=null, probe=null, manager=window.__AWTSMOOS_MANAGER__;
  try{got=window.__AWTSMOOS_GET_ACTIVE_OLAM__?.()}catch(e){got={error:String(e)}}
  try{probe=await window.__AWTSMOOS_REQUEST_PLAYER_PROBE__?.()}catch(e){probe={error:String(e)}}
  const mgr=sobj(manager,1), active=sobj(got,1);
  const reports={world:window.__AWTSMOOS_WORLD_REPORT__, collision:window.__AWTS_COLLISION_DIAG__?.(), grounding:window.__AWTS_GROUNDING_DIAG__?.(), runProof:window.__MITZVAH_RUN_PROOF__?.()};
  return {manager:mgr, active, probe, reports};
 })()` ,60000);
 writeFileSync('ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/real-engine-movie/runtime-deep-probe.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify({ok:true, manager:out.manager, active:out.active, probe:out.probe, reports:out.reports},null,2)); client.close?.();
}finally{await chrome.close();}
