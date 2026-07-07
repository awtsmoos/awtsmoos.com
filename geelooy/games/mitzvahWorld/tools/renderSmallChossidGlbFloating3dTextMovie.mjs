// B"H
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { findBrowser } from '../tests/chrome/ChromePath.js';
import { connectCdp } from '../tests/chrome/ChromeDevTools.js';
const seconds=Number(process.argv.find(a=>a.startsWith('--seconds='))?.split('=')[1]||18),fps=Number(process.argv.find(a=>a.startsWith('--fps='))?.split('=')[1]||12),frames=Math.floor(seconds*fps);
const out='/Users/awtsmoos/Movies/mitzvahWorld/chossid-glb-floating-3d-text-actions-small.mp4';
const proof='ai_thoughts/20260707-112323-small-glb-floating-3d-text-actions/proof';const frameDir=`${proof}/frames`;mkdirSync(frameDir,{recursive:true});rmSync(frameDir,{recursive:true,force:true});mkdirSync(frameDir,{recursive:true});mkdirSync('/Users/awtsmoos/Movies/mitzvahWorld',{recursive:true});
const port=9823,url='http://127.0.0.1:8080/games/mitzvahWorld/tools/smallChossidGlbFloating3dTextMovie.html?bust='+Date.now();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function getJson(u,opts){const r=await fetch(u,opts);if(!r.ok)throw new Error(`${r.status} ${u}`);return r.json()}
async function ev(c,e,t=30000){const r=await c.send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true},t);if(r.exceptionDetails)throw new Error(r.exceptionDetails.text||'eval failed');return r.result?.value}
const chromePath=findBrowser().path;if(!chromePath)throw new Error('Chrome not found');const profile=join(tmpdir(),'awts-small-glb-'+Date.now());
const chrome=spawn(chromePath,[`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--window-size=1280,720','about:blank'],{stdio:'ignore',detached:true});
try{for(let i=0;i<80;i++){try{await getJson(`http://127.0.0.1:${port}/json/version`);break}catch{await sleep(250)}}
const target=await getJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,{method:'PUT'});const client=await connectCdp(target.webSocketDebuggerUrl);await client.send('Runtime.enable');await client.send('Page.enable');
let report=null;for(let i=0;i<120;i++){report=await ev(client,'window.__SMALL_CHOSSID_REPORT__||null').catch(()=>null);if(report?.ready)break;const err=await ev(client,'window.__SMALL_CHOSSID_ERROR__||null').catch(()=>null);if(err)throw new Error(err);await sleep(500)}if(!report?.ready)throw new Error('GLB did not become ready');
for(let i=0;i<frames;i++){await sleep(1000/fps);const png=await client.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},15000);writeFileSync(`${frameDir}/frame_${String(i).padStart(5,'0')}.png`,Buffer.from(png.data,'base64'));if(i%fps===0)report=await ev(client,'window.__SMALL_CHOSSID_REPORT__||null').catch(()=>report)}
const ff=spawnSync('ffmpeg',['-y','-framerate',String(fps),'-i',`${frameDir}/frame_%05d.png`,'-vf','scale=1280:720,format=yuv420p','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',out],{encoding:'utf8'});if(ff.status!==0)throw new Error(ff.stderr);
const fp=spawnSync('ffprobe',['-v','error','-show_format','-show_streams','-count_frames','-print_format','json',out],{encoding:'utf8'});if(fp.status!==0)throw new Error(fp.stderr);
const final={ok:true,output:resolve(out),outsideRepo:!resolve(out).includes('/Documents/awtsmoos/git/'),seconds,fps,frames,report,ffprobe:JSON.parse(fp.stdout)};writeFileSync(`${proof}/final-report.json`,JSON.stringify(final,null,2));console.log(JSON.stringify(final,null,2));spawnSync('open',[out]);client.close?.();}finally{try{process.kill(-chrome.pid)}catch{try{chrome.kill()}catch{}}}
