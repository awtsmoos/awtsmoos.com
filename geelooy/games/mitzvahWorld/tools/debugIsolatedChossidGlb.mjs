// B"H
import { writeFileSync, mkdirSync } from "node:fs";
import { findBrowser } from "../tests/chrome/ChromePath.js";
import { launchChrome } from "../tests/chrome/ChromeLauncher.js";
import { connectCdp } from "../tests/chrome/ChromeDevTools.js";
const out="ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/isolated-glb";mkdirSync(out,{recursive:true});
const url="http://127.0.0.1:8080/games/mitzvahWorld/tools/isolatedChossidGlbInspector.html?debug="+Date.now();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const events=[];
async function ev(c,e){const r=await c.send("Runtime.evaluate",{expression:e,awaitPromise:true,returnByValue:true},10000);return r.result?.value}
const browser=findBrowser();const chrome=await launchChrome(browser.path,url,9775,{width:1280,height:720});
try{const c=await connectCdp(chrome.page.webSocketDebuggerUrl,e=>events.push(e));await c.send("Runtime.enable");await c.send("Page.enable");await ev(c, `location.href=${JSON.stringify(url)}; true`, 10000);await sleep(1500);await c.send("Network.enable");for(let i=0;i<30;i++){await sleep(1000);const state=await ev(c,"({href:location.href,title:document.title,hud:document.getElementById('hud')?.textContent,done:window.__CHOSSID_GLB_DONE__,report:window.__CHOSSID_GLB_INSPECTION__||null,body:document.body?.innerText?.slice(0,500)})").catch(err=>({evalError:String(err)}));console.log(JSON.stringify({tick:i,state},null,2));if(state.done)break}const png=await c.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false},15000);writeFileSync(`${out}/debug-isolated-page.png`,Buffer.from(png.data,"base64"));writeFileSync(`${out}/debug-isolated-events.json`,JSON.stringify(events,null,2));console.log(JSON.stringify({events:events.filter(e=>/exception|console|loadingFailed/.test(e.method)).slice(-20),screenshot:`${out}/debug-isolated-page.png`},null,2));c.close?.()}finally{await chrome.close()}
