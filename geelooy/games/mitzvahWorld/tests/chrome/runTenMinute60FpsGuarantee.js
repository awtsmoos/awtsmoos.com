#!/usr/bin/env node
// B"H
/** Strict wrapper: ten real gameplay minutes must stay at 60 FPS standards. */
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
const reportPath='tests/chrome/lastTenMinute60FpsReport.json';
function run(){return new Promise(resolve=>{const child=spawn(process.execPath,['tests/chrome/runChromeGameplaySimulation.js','--duration=600000','--level=village.json'],{stdio:['ignore','pipe','pipe']});let out='',err='';child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);child.on('close',code=>resolve({code,out,err}));});}
function fail(report,reason){report.ok=false;report.guarantee=false;report.failure=reason;return report;}
const res=await run();
let base={ok:false,rawExit:res.code,stderr:res.err.slice(-4000)};
try{base={...base,...JSON.parse(res.out.slice(res.out.indexOf('{')))};}catch{base.rawStdout=res.out.slice(-4000);}
const s=base.sample||{};
let report={...base,tenMinuteTargetMs:600000,thresholds:{avgFps:60,onePercentLowFps:55,pointOnePercentLowFps:45,p99FrameMs:34,worstFrameMs:120,memoryGrowthBytes:120*1024*1024}};
if(!base.ok)report=fail(report,'base gameplay harness failed');
else if(s.fps<60)report=fail(report,'average FPS below 60');
else if(s.onePercentLowFps<55)report=fail(report,'1% low FPS below 55');
else if(s.pointOnePercentLowFps<45)report=fail(report,'0.1% low FPS below 45');
else if(s.p99FrameMs>34)report=fail(report,'p99 frame time over 34ms');
else if(s.worstFrameMs>120)report=fail(report,'worst frame spike over 120ms');
else if(s.memoryGrowthBytes>120*1024*1024)report=fail(report,'memory growth over 120MB');
else{report.ok=true;report.guarantee=true;report.failure=null;}
await writeFile(reportPath,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.ok)process.exitCode=1;
