// B"H
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { findBrowser } from "../chrome/ChromePath.js";
import { launchChrome } from "../chrome/ChromeLauncher.js";
import { connectCdp } from "../chrome/ChromeDevTools.js";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ev(c, expression, timeoutMs=30000){const r=await c.send("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true},timeoutMs);if(r.exceptionDetails)throw new Error(r.exceptionDetails.text||"eval failed");return r.result?.value;}
const url="http://127.0.0.1:8080/games/mitzvahWorld/tools/awtsmoosCinematicWorldDemo.html?audit="+Date.now();
const chrome=await launchChrome(findBrowser().path,url,9844,{width:1280,height:720});
try{const client=await connectCdp(chrome.page.webSocketDebuggerUrl);await client.send("Runtime.enable");await client.send("Page.enable");let report=null;for(let i=0;i<60;i++){report=await ev(client,"window.__AWTSMOOS_CINEMATIC_WORLD_DEMO_REPORT__||null").catch(()=>null);if(report?.ok)break;await sleep(500)}assert(report?.ok,"demo did not become ready");assert(report.trees>=40,"demo must show real forest density");assert(report.cliffs>=5,"demo must show cliff bands");assert(report.markers.includes("summit"),"story markers missing summit");mkdirSync("ai_thoughts/latest-world-component-proof",{recursive:true});const png=await client.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false},15000);writeFileSync("ai_thoughts/latest-world-component-proof/cinematic-world-demo.png",Buffer.from(png.data,"base64"));console.log(JSON.stringify({ok:true,test:"awtsmoosCinematicWorldDemoAudit",report,screenshot:"ai_thoughts/latest-world-component-proof/cinematic-world-demo.png"},null,2));client.close?.();}finally{await chrome.close();}
